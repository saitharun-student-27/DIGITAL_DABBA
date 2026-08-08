import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingKitchens = await prisma.kitchen.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({ kitchens: pendingKitchens });
  } catch (error: any) {
    console.error('Fetch pending kitchens error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending kitchens' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kitchenId, approve } = await request.json();

    if (!kitchenId) {
      return NextResponse.json({ error: 'Missing kitchenId' }, { status: 400 });
    }

    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
      include: { user: true },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen profile not found' }, { status: 404 });
    }

    const targetStatus = approve ? 'ACTIVE' : 'INACTIVE';

    const updatedKitchen = await prisma.kitchen.update({
      where: { id: kitchenId },
      data: { status: targetStatus },
    });

    // Notify the kitchen owner
    await prisma.notification.create({
      data: {
        userId: kitchen.userId,
        title: approve ? 'Kitchen Approved!' : 'Kitchen Application Status Update',
        message: approve
          ? `Congratulations! Your kitchen "${kitchen.name}" has been approved. You are now LIVE on the marketplace!`
          : `Your kitchen onboarding application requires modifications. Please contact platform support.`,
        type: 'INFO',
      },
    });

    return NextResponse.json({ kitchen: updatedKitchen });
  } catch (error: any) {
    console.error('Verify kitchen error:', error);
    return NextResponse.json({ error: 'Failed to verify kitchen' }, { status: 500 });
  }
}
