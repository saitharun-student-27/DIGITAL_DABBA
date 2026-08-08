import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (role !== 'CUSTOMER' && role !== 'KITCHEN') {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone,
        role,
      },
    });

    if (role === 'CUSTOMER') {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
          address: '',
        },
      });
    } else if (role === 'KITCHEN') {
      await prisma.kitchen.create({
        data: {
          userId: user.id,
          name: `${name}'s Kitchen`,
          cuisine: 'Home Cooked',
          status: 'PENDING_ONBOARDING',
          deliveryFee: 40.0,
          minOrderValue: 0.0,
        },
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'CUSTOMER' | 'KITCHEN',
    });

    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
