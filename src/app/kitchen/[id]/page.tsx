'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  Star, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Info, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

interface Kitchen {
  id: string;
  name: string;
  cuisine: string;
  description: string;
  coverImage: string;
  logo: string;
  rating: number;
  ratingCount: number;
  successfulDeliveries: number;
  onTimeRate: number;
  deliveryFee: number;
  minOrderValue: number;
  cutoffTime: string;
  repeatCustomersCount: number;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export default function KitchenProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { addToCart, cartItems, updateQuantity, cartCount, cartTotal } = useCart();
  const { user } = useAuth();
  
  const [kitchen, setKitchen] = useState<Kitchen | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [activeTab, setActiveTab] = useState<'menu' | 'plans' | 'about' | 'reviews'>('menu');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Calculate cutoff tomorrow string
  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getKitchenDetails = async () => {
    try {
      const { id } = await params;
      const res = await fetch(`/api/kitchens/${id}`);
      const data = await res.json();
      
      if (data.kitchen) {
        setKitchen(data.kitchen);
        setMenuItems(data.kitchen.menuItems || []);
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error('Failed to load kitchen details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getKitchenDetails();
  }, []);

  const handleQtyChange = (itemId: string, diff: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + diff);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!kitchen) return;
    const qty = quantities[item.id] || 1;
    addToCart(kitchen.id, kitchen.name, {
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    }, qty);
    
    // Reset quantity selection indicator back to 1 after adding
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  if (loading) {
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

  if (!kitchen) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FBFBF9] gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-semibold text-brand-dark">Kitchen not found</p>
          <Link href="/explore" className="text-sm font-semibold text-brand-primary underline">
            Go back to kitchens explorer
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AuthModal />

      {/* Cover Image & Branding */}
      <section className="relative h-60 md:h-72 w-full bg-zinc-100">
        <img
          src={kitchen.coverImage || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200'}
          alt={kitchen.name}
          className="object-cover h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-white">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-white border border-white/20 shadow-md">
              <img
                src={kitchen.logo || 'https://images.unsplash.com/photo-1581090464762-c283842c262c?auto=format&fit=crop&q=80&w=200'}
                alt={kitchen.name}
                className="object-cover h-full w-full"
              />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                {kitchen.name}
                <span title="Verified Kitchen"><CheckCircle className="h-5 w-5 text-brand-primary fill-white" /></span>
              </h1>
              <p className="text-xs md:text-sm text-zinc-200 mt-1 font-medium">{kitchen.cuisine}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-center border border-white/10">
              <p className="text-sm font-bold flex items-center justify-center gap-0.5">
                <Star className="h-3.5 w-3.5 fill-brand-accent text-brand-accent" />
                {kitchen.rating}
              </p>
              <p className="text-[9px] text-zinc-300 font-semibold uppercase">Reviews ({kitchen.ratingCount})</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-center border border-white/10">
              <p className="text-sm font-bold">{kitchen.successfulDeliveries.toLocaleString()}</p>
              <p className="text-[9px] text-zinc-300 font-semibold uppercase">Meals Delivered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#FBFBF9] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Tabs & Lists */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Cutoff Alert Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                <Clock className="h-5 w-5 text-brand-accent shrink-0 mt-0.5" />
                <div className="text-xs font-semibold">
                  <p className="font-bold text-brand-dark">Orders Close at {kitchen.cutoffTime} PM Daily</p>
                  <p className="mt-0.5">Place your order before the cutoff to secure next-day delivery on <strong className="underline">{tomorrowStr}</strong>. Kitchens cook only against confirmed pre-orders.</p>
                </div>
              </div>

              {/* Tab Header Row */}
              <div className="flex border-b border-zinc-200">
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'menu'
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'plans'
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  Meal Plans
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'reviews'
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'about'
                      ? 'border-brand-primary text-brand-primary'
                      : 'border-transparent text-brand-gray hover:text-brand-dark'
                  }`}
                >
                  About Chef
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-6">
                
                {/* 1. Menu Tab */}
                {activeTab === 'menu' && (
                  <div className="space-y-6">
                    {menuItems.length === 0 ? (
                      <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                        <p className="text-xs text-brand-gray font-semibold">No menu items available.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm hover:border-zinc-300 transition-all flex gap-4 h-full"
                          >
                            <div className="h-24 w-24 rounded-lg overflow-hidden bg-zinc-50 shrink-0 relative">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=120'}
                                alt={item.name}
                                className="object-cover h-full w-full"
                              />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <div className="flex items-start justify-between">
                                <h3 className="text-sm font-bold text-brand-dark">{item.name}</h3>
                                <span className="text-sm font-extrabold text-brand-primary">₹{item.price}</span>
                              </div>
                              <p className="text-[11px] text-brand-gray mt-1 leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                              
                              {/* Quantity Selector & Add Button */}
                              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-zinc-50">
                                <div className="flex items-center border border-zinc-200 rounded-md">
                                  <button
                                    onClick={() => handleQtyChange(item.id, -1)}
                                    className="p-1 hover:bg-zinc-100 text-brand-gray"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="px-2.5 text-xs font-semibold text-brand-dark">
                                    {quantities[item.id] || 1}
                                  </span>
                                  <button
                                    onClick={() => handleQtyChange(item.id, 1)}
                                    className="p-1 hover:bg-zinc-100 text-brand-gray"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => handleAddToCart(item)}
                                  className="flex-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus className="h-3 w-3" /> Add to Batch
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Meal Plans Tab */}
                {activeTab === 'plans' && (
                  <div className="space-y-4">
                    {[
                      { name: 'Weekly Lunch Box', price: 999, meals: 5, details: '5 fresh homestyle lunch box meals delivered Mon-Fri.' },
                      { name: 'Monthly Office Lunch Plan', price: 3499, meals: 22, details: '22 corporate style thali meals delivered Mon-Sat.' },
                      { name: 'Monthly Dinner Plan', price: 3799, meals: 24, details: '24 light, healthy dinners delivered every evening.' },
                    ].map((plan, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Pre-paid Subscription
                          </span>
                          <h3 className="text-base font-bold text-brand-dark">{plan.name}</h3>
                          <p className="text-xs text-brand-gray">{plan.details}</p>
                          <p className="text-[10px] text-zinc-400">Includes {plan.meals} meals • Pause or skip anytime.</p>
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-none border-zinc-100">
                          <div>
                            <span className="text-xl font-extrabold text-brand-dark">₹{plan.price}</span>
                            <span className="text-[10px] text-brand-gray font-medium">/plan</span>
                          </div>
                          <button
                            onClick={() => alert('Meal subscriptions will automatically hook into your billing plan upon checkout!')}
                            className="bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Calendar className="h-3.5 w-3.5" /> Subscribe
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {/* Why Trust Section */}
                    <div className="bg-[#F2F1EA] border border-zinc-200 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-brand-primary" />
                        Why customers trust HomeBowl Kitchen
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-2">
                        <div className="p-2 bg-white rounded-lg border border-zinc-200">
                          <p className="text-sm font-bold text-brand-dark">{kitchen.successfulDeliveries.toLocaleString()}</p>
                          <p className="text-[8px] text-brand-gray uppercase font-bold">Successful Deliveries</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-zinc-200">
                          <p className="text-sm font-bold text-brand-dark">{kitchen.onTimeRate}%</p>
                          <p className="text-[8px] text-brand-gray uppercase font-bold">Delivery Success</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-zinc-200">
                          <p className="text-sm font-bold text-brand-dark">{kitchen.rating}★</p>
                          <p className="text-[8px] text-brand-gray uppercase font-bold">Average Rating</p>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-zinc-200">
                          <p className="text-sm font-bold text-brand-dark">{kitchen.repeatCustomersCount}</p>
                          <p className="text-[8px] text-brand-gray uppercase font-bold">Repeat Customers</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-400 mt-2">These metrics are calculated from completed orders and verified customer activity on the platform.</p>
                    </div>

                    {/* Review Lists */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-xs text-brand-gray font-semibold">No verified customer reviews yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((rev) => (
                          <div key={rev.id} className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-7 w-7 rounded-full bg-zinc-100 text-brand-dark font-bold text-xs flex items-center justify-center">
                                  {rev.customerName.slice(0, 1)}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-brand-dark flex items-center gap-1.5">
                                    {rev.customerName}
                                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-brand-primary px-1.5 py-0.25 rounded-full border border-emerald-200/80 font-bold">
                                      Verified Order
                                    </span>
                                  </p>
                                  <p className="text-[9px] text-zinc-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < rev.rating ? 'fill-brand-accent text-brand-accent' : 'text-zinc-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-zinc-600 italic">"{rev.text}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. About Tab */}
                {activeTab === 'about' && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4">
                    <h3 className="font-display font-extrabold text-sm text-brand-dark">About the Chef</h3>
                    <p className="text-xs text-brand-gray leading-relaxed font-medium">
                      {kitchen.description}
                    </p>
                    <div className="pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs text-brand-gray">
                      <MapPin className="h-4 w-4 text-brand-primary" />
                      <span>Operating from HSR Layout, Sector 2. Serving hyperlocal areas.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Desktop Checkout Summary */}
            <div className="lg:col-span-4 sticky top-24 hidden lg:block">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-md space-y-4">
                <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-brand-dark">Your Batch Order</span>
                  {cartCount > 0 && (
                    <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                      {cartCount} items
                    </span>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-brand-gray space-y-3">
                    <ShoppingBag className="h-8 w-8 text-zinc-300 mx-auto" />
                    <p className="font-semibold">No orders yet.<br />Your first meal is waiting.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart list */}
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {cartItems.map((ci) => (
                        <div key={ci.menuItemId} className="flex justify-between items-center gap-3">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-brand-dark">{ci.name}</p>
                            <p className="text-[10px] text-brand-gray">₹{ci.price} × {ci.quantity}</p>
                          </div>
                          <div className="flex items-center border border-zinc-200 rounded">
                            <button
                              onClick={() => updateQuantity(ci.menuItemId, ci.quantity - 1)}
                              className="p-0.5 hover:bg-zinc-100 text-brand-gray"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="px-1.5 text-[10px] font-semibold text-brand-dark">{ci.quantity}</span>
                            <button
                              onClick={() => updateQuantity(ci.menuItemId, ci.quantity + 1)}
                              className="p-0.5 hover:bg-zinc-100 text-brand-gray"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-zinc-100 pt-3 space-y-1.5 text-xs text-brand-gray font-medium">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₹{kitchen.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-zinc-100 pt-1.5">
                        <span>Total</span>
                        <span>₹{cartTotal + kitchen.deliveryFee}</span>
                      </div>
                    </div>

                    {/* Trust before payment */}
                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-[9px] text-brand-gray font-medium">
                      <p className="font-bold text-brand-dark flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-brand-primary" />
                        Ordering from: {kitchen.name} ✓
                      </p>
                      <p>{kitchen.rating}★ • {kitchen.successfulDeliveries.toLocaleString()} successful deliveries</p>
                      <p>{kitchen.onTimeRate}% delivered on time</p>
                    </div>

                    <Link
                      href="/checkout"
                      className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-center font-semibold text-xs py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      Place & Pay Order
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating cart bar for mobile devices */}
      {cartCount > 0 && (
        <div className="sticky bottom-0 z-40 w-full bg-white border-t border-zinc-200 p-4 lg:hidden shadow-lg animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-brand-gray font-semibold">{cartCount} items selected</p>
              <p className="text-sm font-bold text-brand-dark">₹{cartTotal + kitchen.deliveryFee}</p>
            </div>
            <Link
              href="/checkout"
              className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="h-4 w-4" /> Checkout
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
