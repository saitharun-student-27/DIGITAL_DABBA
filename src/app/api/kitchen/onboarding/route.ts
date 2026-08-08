import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'KITCHEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      businessName,
      panNumber,
      gstNumber,
      kitchenName,
      cuisine,
      description,
      cutoffTime,
      deliveryArea,
      planName,
      planPrice,
    } = await request.json();

    const kitchen = await prisma.kitchen.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen profile not found' }, { status: 404 });
    }

    // Update Kitchen details and transition state to PENDING_VERIFICATION
    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchen.id },
      data: {
        name: kitchenName || kitchen.name,
        cuisine: cuisine || kitchen.cuisine,
        description: description || kitchen.description,
        cutoffTime: cutoffTime || kitchen.cutoffTime,
        deliveryArea: deliveryArea ? JSON.stringify(deliveryArea) : kitchen.deliveryArea,
        status: 'PENDING_VERIFICATION', // Ready for admin approval!
      },
    });

    // Create Subscription record
    if (planName && planPrice) {
      await prisma.kitchenSubscription.upsert({
        where: { kitchenId: kitchen.id },
        update: {
          planName,
          planPrice: parseFloat(planPrice),
          status: 'ACTIVE',
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          kitchenId: kitchen.id,
          planName,
          planPrice: parseFloat(planPrice),
          status: 'ACTIVE',
          billingCycle: 'MONTHLY',
          nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create Notification for Admins
    await prisma.notification.create({
      data: {
        userId: sessionUser.id, // Notification to the kitchen confirming submission
        title: 'Onboarding Submitted',
        message: 'Your onboarding details and subscription payment are recorded. Admin verification is pending.',
        type: 'INFO',
      },
    });

    return NextResponse.json({ kitchen: updatedKitchen });
  } catch (error: any) {
    console.error('Kitchen onboarding error:', error);
    return NextResponse.json({ error: error.message || 'Onboarding update failed' }, { status: 500 });
  }
}
