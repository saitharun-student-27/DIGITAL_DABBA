import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const category = searchParams.get('category') || '';

    // Build filter condition
    const whereCondition: any = {
      status: 'ACTIVE',
    };

    if (query) {
      whereCondition.OR = [
        { name: { contains: query } },
        { cuisine: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (cuisine) {
      whereCondition.cuisine = { contains: cuisine };
    }

    if (category) {
      // Filter kitchens that have menu items matching the category
      whereCondition.menuItems = {
        some: {
          category: category.toUpperCase(),
          isAvailable: true,
        },
      };
    }

    const kitchens = await prisma.kitchen.findMany({
      where: whereCondition,
      orderBy: { rating: 'desc' },
    });

    return NextResponse.json(
      { kitchens },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error: any) {
    console.error('Fetch kitchens error:', error);
    return NextResponse.json({ error: 'Failed to fetch kitchens' }, { status: 500 });
  }
}
