'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, 
  Calendar, 
  MapPin, 
  CreditCard, 
  User, 
  ChevronRight, 
  RotateCcw, 
  Pause, 
  Play, 
  X,
  CheckCircle,
  Truck
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'subscriptions' | 'addresses'>('overview');

  // Mock subscriptions for UI purposes as requested (Weekly Meal Plan, Monthly Lunch Plan)
  const [subscriptions, setSubscriptions] = useState([
    { id: 'sub_1', planName: 'Weekly Lunch Box', kitchenName: 'HomeBowl Kitchen', price: 999, status: 'ACTIVE', mealsRemaining: 3, deliverySchedule: ['MON', 'WED', 'FRI'] },
    { id: 'sub_2', planName: 'Monthly Dinner Plan', kitchenName: 'HomeBowl Kitchen', price: 3799, status: 'PAUSED', mealsRemaining: 18, deliverySchedule: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] }
  ]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    
    // Add all items in the order back to the cart
    order.items.forEach((item: any) => {
      addToCart(order.kitchenId, order.kitchen.name, {
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
      }, item.quantity);
    });

    // Alert and push to checkout
    alert(`Added items from ${order.kitchen.name} back to your cart!`);
    window.location.href = '/checkout';
  };

  const handleToggleSubscription = (subId: string) => {
    setSubscriptions(prev => 
      prev.map(sub => {
        if (sub.id === subId) {
          return {
            ...sub,
            status: sub.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
          };
        }
        return sub;
      })
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-[#FBFBF9]">
          <span className="h-8 w-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  // Redirect if guest
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <ShoppingBag className="h-10 w-10 text-zinc-300 mx-auto" />
            <h2 className="font-display text-lg font-bold text-brand-dark">Sign in to view your dashboard</h2>
            <p className="text-xs text-brand-gray">Access your active orders, delivery schedules, and meal plan subscriptions.</p>
            <Link
              href="/explore?auth=signin&redirect=/customer"
              className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const activeOrders = orders.filter(o => ['CONFIRMED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY'].includes(o.status));
  const pastOrders = orders.filter(o => ['DELIVERED', 'CANCELLED'].includes(o.status));

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AuthModal />

      <main className="flex-1 bg-[#FBFBF9] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-1 shadow-sm">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'bg-brand-primary/10 text-brand-primary font-extrabold'
                      : 'text-brand-gray hover:bg-zinc-50'
                  }`}
                >
                  <User className="h-4 w-4" /> Account Overview
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'orders'
                      ? 'bg-brand-primary/10 text-brand-primary font-extrabold'
                      : 'text-brand-gray hover:bg-zinc-50'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" /> My Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === 'subscriptions'
                      ? 'bg-brand-primary/10 text-brand-primary font-extrabold'
                      : 'text-brand-gray hover:bg-zinc-50'
                  }`}
                >
                  <Calendar className="h-4 w-4" /> Meal Subscriptions
                </button>
              </div>
            </div>

            {/* Main Tabs Panel */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Active Orders List */}
                  {activeOrders.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="font-display text-sm font-bold text-brand-dark flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-brand-primary" /> Active Orders
                      </h2>
                      <div className="grid grid-cols-1 gap-4">
                        {activeOrders.map((o) => (
                          <div key={o.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-1">
                              <span className="text-[10px] bg-brand-primary/15 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                                {o.status}
                              </span>
                              <h3 className="text-sm font-bold text-brand-dark">{o.kitchen.name}</h3>
                              <p className="text-xs text-brand-gray">Delivery: {new Date(o.deliveryDate).toLocaleDateString()} • {o.deliverySlot}</p>
                              <p className="text-[10px] text-zinc-400">Total: ₹{o.total} • {o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <Link
                                href={`/order-tracking/${o.id}`}
                                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                              >
                                Track Live <ChevronRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Orders Mini List */}
                  <div className="space-y-4">
                    <h2 className="font-display text-sm font-bold text-brand-dark">Recent Orders</h2>
                    {pastOrders.length === 0 ? (
                      <div className="text-center py-10 bg-white border border-zinc-200 rounded-xl">
                        <p className="text-xs text-brand-gray font-semibold">No past orders found.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {pastOrders.slice(0, 3).map((o) => (
                          <div key={o.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-brand-dark">{o.kitchen.name}</h4>
                              <p className="text-[10px] text-brand-gray">Delivered on {new Date(o.deliveryDate).toLocaleDateString()} • ₹{o.total}</p>
                              <p className="text-[10px] text-zinc-400">{o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/order-tracking/${o.id}`}
                                className="text-xs text-brand-gray hover:text-brand-dark px-3 py-1.5 rounded border border-zinc-200 bg-zinc-50"
                              >
                                Details
                              </Link>
                              <button
                                onClick={() => handleReorder(o)}
                                className="bg-zinc-800 hover:bg-brand-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                              >
                                <RotateCcw className="h-3 w-3" /> Reorder
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: All Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="font-display text-sm font-bold text-brand-dark">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-zinc-200 rounded-xl">
                      <p className="text-xs text-brand-gray font-semibold">No orders placed yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {orders.map((o) => (
                        <div key={o.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-3">
                          <div className="flex justify-between items-start pb-3 border-b border-zinc-100">
                            <div>
                              <h3 className="text-sm font-bold text-brand-dark">{o.kitchen.name}</h3>
                              <p className="text-[10px] text-brand-gray">Order Placed: {new Date(o.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-brand-primary'
                                : o.status === 'CANCELLED'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-brand-primary/10 text-brand-primary'
                            }`}>
                              {o.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1.5">
                            {o.items.map((item: any) => (
                              <div key={item.id} className="flex justify-between text-xs text-brand-dark font-medium">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t border-zinc-50 pt-2 flex items-center justify-between text-xs text-brand-gray font-semibold">
                            <span>Total Bill: ₹{o.total}</span>
                            <div className="flex gap-2">
                              <Link
                                href={`/order-tracking/${o.id}`}
                                className="text-brand-primary hover:underline"
                              >
                                Track / View Details
                              </Link>
                              {o.status === 'DELIVERED' && (
                                <button
                                  onClick={() => handleReorder(o)}
                                  className="text-brand-dark hover:underline flex items-center gap-0.5"
                                >
                                  <RotateCcw className="h-3 w-3" /> Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Subscriptions */}
              {activeTab === 'subscriptions' && (
                <div className="space-y-4">
                  <h2 className="font-display text-sm font-bold text-brand-dark">Active Meal Subscriptions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-brand-primary border border-emerald-200'
                                : 'bg-amber-50 text-brand-accent-dark border border-amber-200'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-xs font-extrabold text-brand-dark">₹{sub.price}</span>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-bold text-brand-dark">{sub.planName}</h3>
                            <p className="text-[10px] text-brand-gray">By {sub.kitchenName}</p>
                          </div>
                          
                          <p className="text-xs text-brand-dark font-medium">Meals remaining: <strong>{sub.mealsRemaining} meals</strong></p>
                          <div className="flex gap-1 overflow-hidden">
                            {sub.deliverySchedule.map(day => (
                              <span key={day} className="text-[9px] bg-zinc-50 border border-zinc-200 px-1 rounded font-semibold text-zinc-500">
                                {day}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-zinc-50 flex justify-between items-center text-xs">
                          <button
                            onClick={() => handleToggleSubscription(sub.id)}
                            className={`flex items-center gap-1 font-bold ${
                              sub.status === 'ACTIVE'
                                ? 'text-amber-600 hover:text-amber-700'
                                : 'text-brand-primary hover:text-brand-primary-hover'
                            }`}
                          >
                            {sub.status === 'ACTIVE' ? (
                              <>
                                <Pause className="h-3.5 w-3.5" /> Pause Plan
                              </>
                            ) : (
                              <>
                                <Play className="h-3.5 w-3.5" /> Resume Plan
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => alert('Subscription cancel request submitted!')}
                            className="text-red-500 hover:text-red-600 font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
