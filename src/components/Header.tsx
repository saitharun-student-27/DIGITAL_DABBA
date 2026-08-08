'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Bell, Menu, X, User, LogOut, LayoutDashboard, Compass } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.notifications) {
            setNotifications(data.notifications);
          }
        });
    }
  }, [user]);

  const markNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({}) });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-display font-bold text-lg shadow-sm shadow-brand-primary/40">
                D
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-brand-dark">
                Digital<span className="text-brand-primary">Dabba</span>
              </span>
            </Link>
          </div>

          {/* Location for Hyperlocal Context */}
          {user?.role === 'CUSTOMER' && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-brand-gray border border-zinc-200 px-3 py-1.5 rounded-full bg-zinc-50">
              <Compass className="h-3.5 w-3.5 text-brand-primary" />
              <span>Delivering to: <strong className="text-brand-dark">HSR Layout, Bengaluru</strong></span>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">
              Explore Kitchens
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Role Specific Dashboards */}
                {user.role === 'KITCHEN' && (
                  <Link
                    href="/kitchen/dashboard"
                    className="flex items-center gap-1.5 text-xs font-semibold bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-md hover:bg-brand-primary/20 transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Kitchen OS
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 text-xs font-semibold bg-brand-dark/10 text-brand-dark px-3 py-1.5 rounded-md hover:bg-brand-dark/20 transition-all"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Admin Portal
                  </Link>
                )}
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link href="/customer" className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors">
                      My Orders
                    </Link>
                    {/* Cart Icon */}
                    <Link href="/checkout" className="relative p-1.5 text-brand-gray hover:text-brand-dark transition-colors">
                      <ShoppingBag className="h-5 w-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Notifications Center */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (unreadCount > 0) markNotificationsRead();
                    }}
                    className="relative p-1.5 text-brand-gray hover:text-brand-dark transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-brand-accent ring-2 ring-white" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-zinc-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-dark">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-brand-accent/20 text-brand-accent-dark px-1.5 py-0.5 rounded-full font-medium">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto py-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-brand-gray">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-2.5 rounded-lg hover:bg-zinc-50 transition-colors ${!n.isRead ? 'bg-brand-primary/5' : ''}`}>
                              <p className="text-xs font-medium text-brand-dark">{n.title}</p>
                              <p className="text-[10px] text-brand-gray mt-0.5">{n.message}</p>
                              <p className="text-[9px] text-zinc-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile indicator */}
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-4">
                  <span className="text-xs font-semibold text-brand-dark">{user.name}</span>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 text-brand-gray hover:text-red-600 rounded-md hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-zinc-200 pl-4">
                <Link
                  href="/explore?auth=signin"
                  className="text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors px-3 py-1.5 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/explore?auth=signup"
                  className="text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 rounded-md shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {user?.role === 'CUSTOMER' && (
              <Link href="/checkout" className="relative p-2 text-brand-gray">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-gray hover:text-brand-dark focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3">
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-brand-gray hover:text-brand-dark transition-colors py-2"
          >
            Explore Kitchens
          </Link>
          
          {user ? (
            <div className="pt-2 border-t border-zinc-100 space-y-2">
              <div className="px-2 py-1">
                <p className="text-xs font-semibold text-brand-dark">{user.name}</p>
                <p className="text-[10px] text-brand-gray">{user.email}</p>
              </div>
              {user.role === 'KITCHEN' && (
                <Link
                  href="/kitchen/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-brand-primary hover:bg-brand-primary/5 py-2 px-2 rounded-md"
                >
                  Kitchen OS Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-semibold text-brand-dark hover:bg-zinc-100 py-2 px-2 rounded-md"
                >
                  Admin Dashboard
                </Link>
              )}
              {user.role === 'CUSTOMER' && (
                <Link
                  href="/customer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm font-medium text-brand-gray hover:text-brand-dark py-2 px-2 rounded-md"
                >
                  My Orders & Subscriptions
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left text-sm font-semibold text-red-600 hover:bg-red-50 py-2 px-2 rounded-md flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
              <Link
                href="/explore?auth=signin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-medium text-brand-gray py-2.5 rounded-md border border-zinc-200"
              >
                Sign In
              </Link>
              <Link
                href="/explore?auth=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-sm font-semibold text-white bg-brand-primary py-2.5 rounded-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
