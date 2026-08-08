import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// Recipe database helper (factors per serving)
const RECIPE_MAP: Record<string, Array<{ ingredient: string; qty: number; unit: string }>> = {
  'Chicken Thali': [
    { ingredient: 'Chicken', qty: 0.2, unit: 'kg' },
    { ingredient: 'Rice', qty: 0.15, unit: 'kg' },
    { ingredient: 'Vegetables', qty: 0.1, unit: 'kg' },
    { ingredient: 'Packaging Boxes', qty: 1, unit: 'units' },
  ],
  'Veg Thali': [
    { ingredient: 'Paneer', qty: 0.08, unit: 'kg' },
    { ingredient: 'Rice', qty: 0.15, unit: 'kg' },
    { ingredient: 'Vegetables', qty: 0.15, unit: 'kg' },
    { ingredient: 'Packaging Boxes', qty: 1, unit: 'units' },
  ],
  'Paneer Meal': [
    { ingredient: 'Paneer', qty: 0.15, unit: 'kg' },
    { ingredient: 'Rice', qty: 0.15, unit: 'kg' },
    { ingredient: 'Vegetables', qty: 0.05, unit: 'kg' },
    { ingredient: 'Packaging Boxes', qty: 1, unit: 'units' },
  ],
  'Dal Rice': [
    { ingredient: 'Rice', qty: 0.2, unit: 'kg' },
    { ingredient: 'Vegetables', qty: 0.05, unit: 'kg' },
    { ingredient: 'Packaging Boxes', qty: 1, unit: 'units' },
  ],
  'Healthy Oats Bowl': [
    { ingredient: 'Oats', qty: 0.1, unit: 'kg' },
    { ingredient: 'Packaging Boxes', qty: 1, unit: 'units' },
  ],
};

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const targetDate = searchParams.get('date') || tomorrowStr;

    // --- KPIs ---
    // 1. Today's Orders
    const todayOrdersCount = await prisma.order.count({
      where: { kitchenId: kitchen.id, deliveryDate: todayStr, paymentStatus: 'PAID' },
    });

    // 2. Tomorrow's Orders
    const tomorrowOrdersCount = await prisma.order.count({
      where: { kitchenId: kitchen.id, deliveryDate: tomorrowStr, paymentStatus: 'PAID' },
    });

    // 3. Today's Revenue
    const todayOrders = await prisma.order.findMany({
      where: { kitchenId: kitchen.id, deliveryDate: todayStr, paymentStatus: 'PAID' },
      select: { total: true },
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // 4. Pending Orders (for today)
    const pendingOrdersCount = await prisma.order.count({
      where: {
        kitchenId: kitchen.id,
        deliveryDate: todayStr,
        status: { in: ['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY'] },
      },
    });

    // 5. Repeat Rate / Repeat Customers Count
    const repeatRate = kitchen.repeatCustomersCount;

    // --- PRODUCTION MANIFEST & DYNAMIC INVENTORY REQUIREMENT ---
    // Fetch all confirmed/paid order items for the target date
    const manifestOrders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        deliveryDate: targetDate,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
    });

    // Aggregate meal counts
    const mealCounts: Record<string, number> = {};
    manifestOrders.forEach((order) => {
      order.items.forEach((item) => {
        mealCounts[item.name] = (mealCounts[item.name] || 0) + item.quantity;
      });
    });

    const manifestItems = Object.entries(mealCounts).map(([name, quantity]) => ({
      itemName: name,
      quantity,
    }));

    const totalMealsToProduce = manifestItems.reduce((sum, item) => sum + item.quantity, 0);

    // Dynamic Ingredient Requirements Calculation
    const ingredientRequirements: Record<string, { required: number; unit: string }> = {};

    manifestItems.forEach((meal) => {
      const recipe = RECIPE_MAP[meal.itemName];
      if (recipe) {
        recipe.forEach((ingredientInfo) => {
          const totalNeeded = ingredientInfo.qty * meal.quantity;
          if (!ingredientRequirements[ingredientInfo.ingredient]) {
            ingredientRequirements[ingredientInfo.ingredient] = {
              required: 0,
              unit: ingredientInfo.unit,
            };
          }
          ingredientRequirements[ingredientInfo.ingredient].required += totalNeeded;
        });
      }
    });

    // Get current inventory levels from DB
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { kitchenId: kitchen.id },
    });

    // Sync inventory requirements with database and compute shortfalls
    const syncedInventory: any[] = [];
    for (const [ingredientName, reqInfo] of Object.entries(ingredientRequirements)) {
      // Find if we have it in DB
      let dbItem = inventoryItems.find((i) => i.ingredientName === ingredientName);
      
      if (!dbItem) {
        // If not in DB, create it with 0 available
        dbItem = await prisma.inventoryItem.create({
          data: {
            kitchenId: kitchen.id,
            ingredientName,
            requiredQty: parseFloat(reqInfo.required.toFixed(2)),
            availableQty: 0.0,
            unit: reqInfo.unit,
          },
        });
      } else {
        // If in DB, update requiredQty
        dbItem = await prisma.inventoryItem.update({
          where: { id: dbItem.id },
          data: {
            requiredQty: parseFloat(reqInfo.required.toFixed(2)),
          },
        });
      }

      const shortfall = Math.max(0, dbItem.requiredQty - dbItem.availableQty);
      syncedInventory.push({
        id: dbItem.id,
        ingredientName,
        requiredQty: dbItem.requiredQty,
        availableQty: dbItem.availableQty,
        unit: dbItem.unit,
        shortfall: parseFloat(shortfall.toFixed(2)),
        status: shortfall > 0 ? 'SHORT' : 'READY',
      });
    }

    // Add any inventory items that are in DB but not in the requirements for tomorrow
    inventoryItems.forEach((dbItem) => {
      const isRequired = syncedInventory.some((s) => s.ingredientName === dbItem.ingredientName);
      if (!isRequired) {
        syncedInventory.push({
          id: dbItem.id,
          ingredientName: dbItem.ingredientName,
          requiredQty: 0.0,
          availableQty: dbItem.availableQty,
          unit: dbItem.unit,
          shortfall: 0.0,
          status: 'READY',
        });
      }
    });

    // --- DELIVERY CLUSTERING ---
    // Group orders geographically by sector or road based on address
    const clusters: Record<string, { count: number; orders: any[] }> = {
      'Zone A (Sector 1 & 2)': { count: 0, orders: [] },
      'Zone B (Sector 3)': { count: 0, orders: [] },
      'Zone C (Other Areas)': { count: 0, orders: [] },
    };

    const deliveryOrders = await prisma.order.findMany({
      where: {
        kitchenId: kitchen.id,
        deliveryDate: targetDate,
        paymentStatus: 'PAID',
        status: { in: ['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY'] },
      },
      select: {
        id: true,
        deliveryAddress: true,
        total: true,
        status: true,
        deliverySlot: true,
      },
    });

    deliveryOrders.forEach((order) => {
      const addr = order.deliveryAddress.toLowerCase();
      if (addr.includes('sector 1') || addr.includes('sector 2')) {
        clusters['Zone A (Sector 1 & 2)'].count++;
        clusters['Zone A (Sector 1 & 2)'].orders.push(order);
      } else if (addr.includes('sector 3')) {
        clusters['Zone B (Sector 3)'].count++;
        clusters['Zone B (Sector 3)'].orders.push(order);
      } else {
        clusters['Zone C (Other Areas)'].count++;
        clusters['Zone C (Other Areas)'].orders.push(order);
      }
    });

    // Clean up empty clusters in return value
    const formattedClusters = Object.entries(clusters).map(([name, data]) => ({
      zone: name,
      count: data.count,
      orders: data.orders,
    }));

    return NextResponse.json({
      kpis: {
        todayOrders: todayOrdersCount,
        tomorrowOrders: tomorrowOrdersCount,
        todayRevenue,
        pendingOrders: pendingOrdersCount,
        repeatRate,
        wastePercent: 0.0, // Cook what's sold!
      },
      manifest: {
        date: targetDate,
        totalMeals: totalMealsToProduce,
        items: manifestItems,
      },
      inventory: syncedInventory,
      deliveryClusters: formattedClusters,
    });
  } catch (error: any) {
    console.error('Kitchen dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}

// Allows kitchen staff to adjust available inventory counts directly
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

    const { ingredientName, availableQty, unit } = await request.json();

    if (!ingredientName || availableQty === undefined || !unit) {
      return NextResponse.json({ error: 'Missing inventory fields' }, { status: 400 });
    }

    const updatedItem = await prisma.inventoryItem.upsert({
      where: {
        kitchenId_ingredientName: {
          kitchenId: kitchen.id,
          ingredientName,
        },
      },
      update: {
        availableQty: parseFloat(availableQty),
      },
      create: {
        kitchenId: kitchen.id,
        ingredientName,
        availableQty: parseFloat(availableQty),
        unit,
      },
    });

    return NextResponse.json({ inventoryItem: updatedItem });
  } catch (error: any) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
