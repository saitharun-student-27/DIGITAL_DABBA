import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const kitchen = await prisma.kitchen.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { isAvailable: true },
        },
      },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen not found' }, { status: 404 });
    }

    // Get reviews for this kitchen
    const reviews = await prisma.review.findMany({
      where: {
        order: {
          kitchenId: id,
        },
      },
      include: {
        customer: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Format reviews
    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      customerName: r.customer.user.name,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt,
    }));

    return NextResponse.json({
      kitchen,
      reviews: formattedReviews,
    });
  } catch (error: any) {
    console.error('Fetch kitchen details error:', error);
    return NextResponse.json({ error: 'Failed to fetch kitchen details' }, { status: 500 });
  }
}
