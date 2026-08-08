import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'KITCHEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kitchen = await prisma.kitchen.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen profile not found' }, { status: 404 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { kitchenId: kitchen.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ menuItems });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== 'KITCHEN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const kitchen = await prisma.kitchen.findUnique({
      where: { userId: sessionUser.id },
    });

    if (!kitchen) {
      return NextResponse.json({ error: 'Kitchen profile not found' }, { status: 404 });
    }

    const { id, name, description, price, category, isAvailable, image } = await request.json();

    if (!name || price === undefined || !category) {
      return NextResponse.json({ error: 'Missing required menu fields' }, { status: 400 });
    }

    let menuItem;

    if (id) {
      // Update existing item
      menuItem = await prisma.menuItem.update({
        where: { id },
        data: {
          name,
          description: description || '',
          price: parseFloat(price),
          category: category.toUpperCase(),
          isAvailable: isAvailable !== undefined ? isAvailable : true,
          image: image || null,
        },
      });
    } else {
      // Create new item
      menuItem = await prisma.menuItem.create({
        data: {
          kitchenId: kitchen.id,
          name,
          description: description || '',
          price: parseFloat(price),
          category: category.toUpperCase(),
          isAvailable: true,
          image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
        },
      });
    }

    return NextResponse.json({ menuItem });
  } catch (error: any) {
    console.error('Menu item save error:', error);
    return NextResponse.json({ error: 'Failed to save menu item' }, { status: 500 });
  }
}
