import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ user: null });
    }

    // Fetch full profile info depending on the role
    let profileDetails = {};
    if (sessionUser.role === 'CUSTOMER') {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: sessionUser.id },
      });
      profileDetails = { customerProfile: profile };
    } else if (sessionUser.role === 'KITCHEN') {
      const profile = await prisma.kitchen.findUnique({
        where: { userId: sessionUser.id },
      });
      profileDetails = { kitchenProfile: profile };
    }

    return NextResponse.json({
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        role: sessionUser.role,
        ...profileDetails,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ user: null });
  }
}
