import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        kitchen: {
          select: { id: true, name: true, logo: true, cutoffTime: true, deliveryFee: true, successfulDeliveries: true, rating: true, onTimeRate: true },
        },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// Update order status (Kitchen action)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { kitchen: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization: Only the assigned kitchen or admin can update order status
    if (sessionUser.role === 'KITCHEN' && order.kitchen.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Status state machine timestamps
    const updateData: any = { status };
    const now = new Date();

    if (status === 'CONFIRMED') updateData.confirmedAt = now;
    else if (status === 'PREPARING') updateData.preparingAt = now;
    else if (status === 'PACKED') updateData.packedAt = now;
    else if (status === 'OUT_FOR_DELIVERY') updateData.outForDeliveryAt = now;
    else if (status === 'DELIVERED') {
      updateData.deliveredAt = now;
      
      // Update successful deliveries on delivery
      await prisma.kitchen.update({
        where: { id: order.kitchenId },
        data: {
          successfulDeliveries: { increment: 1 },
        },
      });
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = now;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // Notify customer about status update
    const customerUser = await prisma.customerProfile.findUnique({
      where: { id: order.customerId },
      select: { userId: true },
    });

    if (customerUser) {
      let message = `Your order status from ${order.kitchen.name} has been updated to ${status}.`;
      if (status === 'CONFIRMED') message = `Your order from ${order.kitchen.name} is confirmed.`;
      else if (status === 'PREPARING') message = `Your meal is being prepared at ${order.kitchen.name}.`;
      else if (status === 'PACKED') message = `Your meal has been packed and is ready.`;
      else if (status === 'OUT_FOR_DELIVERY') message = `Your order from ${order.kitchen.name} is out for delivery.`;
      else if (status === 'DELIVERED') message = `Your order has arrived! Enjoy your fresh meal.`;

      await prisma.notification.create({
        data: {
          userId: customerUser.userId,
          title: `Order Update: ${status}`,
          message,
          type: 'ORDER_STATUS',
        },
      });
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

// Post verified review (Customer action)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, text, foodQualityRating, packagingRating, deliveryRating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating (must be 1-5)' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        kitchen: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify order owner
    if (order.customer.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify order is delivered
    if (order.status !== 'DELIVERED') {
      return NextResponse.json({ error: 'Only completed orders can be reviewed' }, { status: 400 });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: { orderId: id },
    });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this order' }, { status: 400 });
    }

    // Save review
    const review = await prisma.review.create({
      data: {
        customerId: order.customerId,
        orderId: id,
        rating,
        text: text || '',
      },
    });

    // Update order with ratings
    await prisma.order.update({
      where: { id },
      data: {
        rating,
        reviewText: text || '',
        foodQualityRating,
        packagingRating,
        deliveryRating,
      },
    });

    // Recalculate kitchen trust metrics
    const allRatings = await prisma.order.findMany({
      where: {
        kitchenId: order.kitchenId,
        rating: { not: null },
      },
      select: { rating: true },
    });

    const totalRatingsCount = allRatings.length;
    const averageRating = totalRatingsCount > 0
      ? parseFloat((allRatings.reduce((acc, r) => acc + (r.rating || 0), 0) / totalRatingsCount).toFixed(1))
      : 5.0;

    // Calculate Repeat Customer rate
    const uniqueCustomersOrders = await prisma.order.findMany({
      where: { kitchenId: order.kitchenId, status: 'DELIVERED' },
      select: { customerId: true },
    });
    const customerOrderCounts: Record<string, number> = {};
    uniqueCustomersOrders.forEach(o => {
      customerOrderCounts[o.customerId] = (customerOrderCounts[o.customerId] || 0) + 1;
    });
    const totalUniqueCustomers = Object.keys(customerOrderCounts).length;
    const repeatCustomers = Object.values(customerOrderCounts).filter(count => count >= 2).length;
    
    await prisma.kitchen.update({
      where: { id: order.kitchenId },
      data: {
        rating: averageRating,
        ratingCount: totalRatingsCount,
        repeatCustomersCount: repeatCustomers,
      },
    });

    // Notify kitchen about new review
    await prisma.notification.create({
      data: {
        userId: order.kitchen.userId,
        title: 'New Customer Review!',
        message: `Rahul or another customer left a ${rating}★ review: "${(text || '').slice(0, 30)}..."`,
        type: 'INFO',
      },
    });

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
