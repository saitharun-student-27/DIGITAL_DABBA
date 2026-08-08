const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.mealSubscription.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.kitchenSubscription.deleteMany();
  await prisma.productionManifestItem.deleteMany();
  await prisma.productionManifest.deleteMany();
  await prisma.kitchen.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create default password hash (password: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@digitaldabba.com',
      passwordHash,
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  });

  const kitchenUser = await prisma.user.create({
    data: {
      email: 'kitchen@digitaldabba.com',
      passwordHash,
      name: 'Chef Raj',
      role: 'KITCHEN',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@digitaldabba.com',
      passwordHash,
      name: 'Rahul Kumar',
      role: 'CUSTOMER',
    },
  });

  // Create Customer Profile for customer
  const customerProfile = await prisma.customerProfile.create({
    data: {
      userId: customerUser.id,
      address: 'Apartment 402, Oakwood Enclave, HSR Layout, Bengaluru',
      latitude: 12.9141,
      longitude: 77.6412,
    },
  });

  // 4. Create Kitchen Profile
  const kitchen = await prisma.kitchen.create({
    data: {
      userId: kitchenUser.id,
      name: 'HomeBowl Kitchen',
      cuisine: 'North Indian • Healthy Meals',
      description: 'Ghar jaisa khana — prepared with love from fresh, local ingredients. Cooked only against confirmed orders to eliminate waste and deliver ultimate freshness.',
      coverImage: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200',
      logo: 'https://images.unsplash.com/photo-1581090464762-c283842c262c?auto=format&fit=crop&q=80&w=200',
      status: 'ACTIVE',
      cutoffTime: '21:00',
      deliveryFee: 40.0,
      minOrderValue: 0.0,
      deliveryArea: JSON.stringify(['HSR Layout', 'Koramangala', 'Bellandur']),
      successfulDeliveries: 12482,
      onTimeRate: 98.4,
      rating: 4.8,
      ratingCount: 154,
      repeatCustomersCount: 1240,
    },
  });

  // Create active subscription for the kitchen
  await prisma.kitchenSubscription.create({
    data: {
      kitchenId: kitchen.id,
      planName: 'GROWTH',
      planPrice: 2499.0,
      status: 'ACTIVE',
      billingCycle: 'MONTHLY',
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Create Menu Items
  const chickenThali = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen.id,
      name: 'Chicken Thali',
      description: 'Homestyle tender chicken curry, spiced dal tadka, seasonal aloo beans dry, fragrant basmati rice, and 2 soft chapatis.',
      price: 199.0,
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600',
      category: 'LUNCH',
      isAvailable: true,
    },
  });

  const vegThali = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen.id,
      name: 'Veg Thali',
      description: 'Shahi paneer butter masala, creamy yellow dal fry, aloo beans dry, jeera rice, and 2 soft chapatis.',
      price: 149.0,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
      category: 'LUNCH',
      isAvailable: true,
    },
  });

  const paneerMeal = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen.id,
      name: 'Paneer Meal',
      description: 'Paneer tikka masala served with aromatic peas pulao, cucumber raita, and garlic naan.',
      price: 169.0,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600',
      category: 'DINNER',
      isAvailable: true,
    },
  });

  const dalRice = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen.id,
      name: 'Dal Rice',
      description: 'Comfort food bowl of slow-cooked yellow arhar dal, ghee tempered with cumin, red chilies, and garlic, served with basmati rice.',
      price: 99.0,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600',
      category: 'BUDGET',
      isAvailable: true,
    },
  });

  const oatmealBowl = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen.id,
      name: 'Healthy Oats Bowl',
      description: 'High-protein steel-cut oats in almond milk, topped with sliced bananas, strawberries, blue berries, chia seeds, and raw honey.',
      price: 129.0,
      image: 'https://images.unsplash.com/photo-1517881917431-13488d537848?auto=format&fit=crop&q=80&w=600',
      category: 'HEALTHY',
      isAvailable: true,
    },
  });

  // 6. Create Seed Data for Orders
  // We need to simulate:
  // Tomorrow's manifest showing:
  // - Chicken Thali: 87 orders
  // - Veg Thali: 64 orders
  // - Paneer Meal: 42 orders
  // - Dal Rice: 38 orders
  // Total = 231 confirmed meals.
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // We will create some mock customer users to attribute these orders to.
  const mockNames = ['Amit Sharma', 'Priya Patel', 'Rohan Das', 'Ananya Sen', 'Vikram Singh', 'Siddharth Roy', 'Sneha Gupta', 'Karan Johar', 'Neha Sharma', 'Deepak Verma'];
  const customers = [];

  for (let i = 0; i < mockNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        email: `customer${i + 1}@digitaldabba.com`,
        passwordHash,
        name: mockNames[i],
        role: 'CUSTOMER',
      },
    });

    const profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        address: `${100 + i * 15}, 5th Main Road, Sector ${i % 3 + 1}, HSR Layout, Bengaluru`,
        latitude: 12.91 + (i * 0.001),
        longitude: 77.64 + (i * 0.001),
      },
    });
    customers.push(profile);
  }

  // We add our seeded customer User to the array
  customers.push(customerProfile);

  // We'll distribute the 231 items among 120 orders for tomorrow.
  const itemQuotas = [
    { item: chickenThali, count: 87 },
    { item: vegThali, count: 64 },
    { item: paneerMeal, count: 42 },
    { item: dalRice, count: 38 },
  ];

  // Let's create orders
  let orderIndex = 1;
  const deliverySlots = ['12:00 PM - 1:00 PM', '1:00 PM - 2:00 PM', '7:30 PM - 8:30 PM', '8:30 PM - 9:30 PM'];

  for (const quota of itemQuotas) {
    let remaining = quota.count;
    while (remaining > 0) {
      // Pick a random customer
      const cust = customers[Math.floor(Math.random() * customers.length)];
      // Choose quantity between 1 and 3 (limited by remaining)
      const qty = Math.min(Math.floor(Math.random() * 3) + 1, remaining);
      remaining -= qty;

      const subtotal = quota.item.price * qty;
      const deliveryFee = kitchen.deliveryFee;
      const total = subtotal + deliveryFee;
      const slot = deliverySlots[Math.floor(Math.random() * deliverySlots.length)];

      await prisma.order.create({
        data: {
          customerId: cust.id,
          kitchenId: kitchen.id,
          status: 'CONFIRMED',
          subtotal,
          deliveryFee,
          total,
          deliveryDate: tomorrowStr,
          deliverySlot: slot,
          deliveryAddress: cust.address,
          paymentId: `pay_mock_${orderIndex++}_${Math.random().toString(36).substring(7)}`,
          paymentStatus: 'PAID',
          confirmedAt: new Date(),
          items: {
            create: {
              menuItemId: quota.item.id,
              name: quota.item.name,
              quantity: qty,
              price: quota.item.price,
            },
          },
        },
      });
    }
  }

  // 7. Create past completed orders for Analytics
  // We need to show Today's Revenue as ₹42,780 and Today's Orders as 184.
  const todayStr = new Date().toISOString().split('T')[0];
  const itemPool = [chickenThali, vegThali, paneerMeal, dalRice];
  let todayTotalRevenue = 0;
  let todayOrdersCount = 0;

  // Let's seed orders for TODAY. We will seed exactly 184 orders, totaling around ₹42,780.
  // Average price of a meal is roughly 150. So 184 * 150 = 27,600. With delivery fees (40 * 184 = 7,360) = 34,960. 
  // Let's make sure the total price sums up to exactly 42,780.
  // Target: 42,780. Subtract delivery fees for 184 orders (184 * 40 = 7,360) = 35,420 required for food.
  // We can write a loop to generate exactly 184 orders.
  const totalOrdersToCreate = 184;
  const targetFoodSubtotal = 35420;
  let accumulatedSubtotal = 0;

  for (let i = 0; i < totalOrdersToCreate; i++) {
    const cust = customers[Math.floor(Math.random() * customers.length)];
    const slot = deliverySlots[Math.floor(Math.random() * deliverySlots.length)];
    
    // Pick a random item
    const item = itemPool[Math.floor(Math.random() * itemPool.length)];
    // Adjust quantity
    let qty = 1;
    if (i < 50) qty = 2; // boost first 50 orders to 2 items to hit the subtotal target
    
    const subtotal = item.price * qty;
    accumulatedSubtotal += subtotal;
    const total = subtotal + kitchen.deliveryFee;

    // Set order status as DELIVERED or CONFIRMED depending on test cases
    // We want some "PENDING_ORDERS" (e.g. 27) and the rest as completed/delivered.
    // 27 pending orders, 157 delivered orders.
    const isPending = i < 27;
    const orderStatus = isPending ? 'PREPARING' : 'DELIVERED';
    
    await prisma.order.create({
      data: {
        customerId: cust.id,
        kitchenId: kitchen.id,
        status: orderStatus,
        subtotal,
        deliveryFee: kitchen.deliveryFee,
        total,
        deliveryDate: todayStr,
        deliverySlot: slot,
        deliveryAddress: cust.address,
        paymentId: `pay_today_${i}_${Math.random().toString(36).substring(7)}`,
        paymentStatus: 'PAID',
        confirmedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        preparingAt: isPending ? new Date() : new Date(Date.now() - 3 * 60 * 60 * 1000),
        packedAt: isPending ? null : new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        outForDeliveryAt: isPending ? null : new Date(Date.now() - 2 * 60 * 60 * 1000),
        deliveredAt: isPending ? null : new Date(Date.now() - 1 * 60 * 60 * 1000),
        items: {
          create: {
            menuItemId: item.id,
            name: item.name,
            quantity: qty,
            price: item.price,
          },
        },
      },
    });

    todayOrdersCount++;
    todayTotalRevenue += total;
  }

  // Adjust one order to hit the exact today's revenue target of ₹42,780
  const currentDiff = 42780 - todayTotalRevenue;
  console.log(`Initial today revenue: ₹${todayTotalRevenue}. Target: ₹42,780. Diff: ₹${currentDiff}`);
  if (Math.abs(currentDiff) > 0) {
    // Find one order from today and update its total to adjust the diff
    const oneOrder = await prisma.order.findFirst({
      where: { deliveryDate: todayStr },
    });
    if (oneOrder) {
      await prisma.order.update({
        where: { id: oneOrder.id },
        data: {
          subtotal: oneOrder.subtotal + currentDiff,
          total: oneOrder.total + currentDiff,
        },
      });
    }
  }

  console.log(`Today's KPIs Seeded successfully: 184 Orders, ₹42,780 Revenue.`);

  // 8. Seed Inventory items
  // Required: Chicken: 18 kg required, 21 kg available (READY)
  // Required: Rice: 12 kg required, 10 kg available (2 kg SHORT)
  // Required: Paneer: 8 kg required, 8.5 kg available (READY)
  await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen.id,
      ingredientName: 'Chicken',
      requiredQty: 18.0,
      availableQty: 21.0,
      unit: 'kg',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen.id,
      ingredientName: 'Rice',
      requiredQty: 12.0,
      availableQty: 10.0,
      unit: 'kg',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen.id,
      ingredientName: 'Paneer',
      requiredQty: 8.0,
      availableQty: 8.5,
      unit: 'kg',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen.id,
      ingredientName: 'Vegetables',
      requiredQty: 15.0,
      availableQty: 15.0,
      unit: 'kg',
    },
  });

  await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen.id,
      ingredientName: 'Packaging Boxes',
      requiredQty: 231.0,
      availableQty: 250.0,
      unit: 'units',
    },
  });

  // 9. Seed reviews (with Rahul's review)
  const rahulProfile = customers.find(c => c.user?.name === 'Rahul Kumar' || c.address.includes('Apartment 402'));
  const targetCust = rahulProfile || customers[0];

  const reviewedOrder = await prisma.order.create({
    data: {
      customerId: targetCust.id,
      kitchenId: kitchen.id,
      status: 'DELIVERED',
      subtotal: 199.0,
      deliveryFee: 40.0,
      total: 239.0,
      deliveryDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliverySlot: '1:00 PM - 2:00 PM',
      deliveryAddress: targetCust.address,
      paymentId: 'pay_past_review',
      paymentStatus: 'PAID',
      deliveredAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      items: {
        create: {
          menuItemId: chickenThali.id,
          name: chickenThali.name,
          quantity: 1,
          price: chickenThali.price,
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      customerId: targetCust.id,
      orderId: reviewedOrder.id,
      rating: 5,
      text: 'Food arrived hot and exactly on time. Homestyle chicken curry is simply amazing!',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
