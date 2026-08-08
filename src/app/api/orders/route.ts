import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// Helper to check if current local time is past the kitchen's cutoff time for tomorrow's delivery
function isPastCutoff(cutoffTimeStr: string, deliveryDateStr: string): boolean {
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // If delivery date is not tomorrow, cutoff doesn't apply for next-day production.
  // (Assuming orders for days after tomorrow are always open)
  if (deliveryDateStr !== tomorrowStr) {
    return false;
  }

  // Parse cutoff (e.g. "21:00")
  const [cutoffHour, cutoffMinute] = cutoffTimeStr.split(':').map(Number);
  
  // Get current local time in India (since the local time is India time)
  // Let's use standard Date which runs in local machine timezone.
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (currentHour > cutoffHour) {
    return true;
  }
  if (currentHour === cutoffHour && currentMinute >= cutoffMinute) {
    return true;
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (sessionUser.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can place orders' }, { status: 403 });
    }

    const customer = await prisma.customerProfile.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    const { kitchenId, items, deliveryDate, deliverySlot, deliveryAddress, paymentMethod } = await request.json();

    if (!kitchenId || !items || !items.length || !deliveryDate || !deliverySlot || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen not found' }, { status: 404 });
    }

    // Cutoff Time check
    if (isPastCutoff(kitchen.cutoffTime, deliveryDate)) {
      return NextResponse.json({
        error: `Orders close at ${kitchen.cutoffTime} for tomorrow's delivery. Please select the next available production date.`,
        cutoffViolation: true
      }, { status: 400 });
    }

    // Resolve items and calculate pricing
    let subtotal = 0;
    const resolvedItems = [];

    for (const orderItem of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: orderItem.menuItemId },
      });

      if (!menuItem || menuItem.kitchenId !== kitchenId) {
        return NextResponse.json({ error: `Menu item not found: ${orderItem.menuItemId}` }, { status: 400 });
      }

      if (!menuItem.isAvailable) {
        return NextResponse.json({ error: `${menuItem.name} is currently unavailable` }, { status: 400 });
      }

      subtotal += menuItem.price * orderItem.quantity;
      resolvedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: orderItem.quantity,
        price: menuItem.price,
      });
    }

    const deliveryFee = kitchen.deliveryFee;
    const total = subtotal + deliveryFee;

    // Create Order with status CONFIRMED and paymentStatus PAID
    // (mocking instant payment success for hackathon checkout flow)
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        kitchenId: kitchenId,
        status: 'CONFIRMED',
        subtotal,
        deliveryFee,
        total,
        deliveryDate,
        deliverySlot,
        deliveryAddress,
        paymentId: `pay_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        paymentStatus: 'PAID',
        confirmedAt: new Date(),
        items: {
          create: resolvedItems,
        },
      },
    });

    // Create Notification for the kitchen
    await prisma.notification.create({
      data: {
        userId: kitchen.userId,
        title: 'New Confirmed Order!',
        message: `Order ${order.id.slice(0, 8)}: Received ${resolvedItems.reduce((acc, i) => acc + i.quantity, 0)} meals for ${deliveryDate}.`,
        type: 'ORDER_STATUS',
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let orders: any[] = [];

    if (sessionUser.role === 'CUSTOMER') {
      const customer = await prisma.customerProfile.findUnique({
        where: { userId: sessionUser.id },
      });
      if (customer) {
        orders = await prisma.order.findMany({
          where: { customerId: customer.id },
          include: {
            kitchen: {
              select: { name: true, logo: true },
            },
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    } else if (sessionUser.role === 'KITCHEN') {
      const kitchen = await prisma.kitchen.findUnique({
        where: { userId: sessionUser.id },
      });
      if (kitchen) {
        orders = await prisma.order.findMany({
          where: { kitchenId: kitchen.id },
          include: {
            customer: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
            items: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
