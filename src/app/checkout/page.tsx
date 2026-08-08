'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function Checkout() {
  const { cartItems, cartTotal, kitchenId, kitchenName, deliveryDate, deliverySlot, setDeliveryInfo, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [slot, setSlot] = useState(deliverySlot);
  const [date, setDate] = useState(deliveryDate);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Available delivery slots
  const slots = [
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '7:30 PM - 8:30 PM',
    '8:30 PM - 9:30 PM'
  ];

  // Next 5 dates
  const [availableDates, setAvailableDates] = useState<any[]>([]);

  useEffect(() => {
    // Generate next 5 dates starting tomorrow
    const dates = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      dates.push({
        value: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    setAvailableDates(dates);
    if (!date && dates.length > 0) {
      setDate(dates[0].value);
    }
  }, []);

  useEffect(() => {
    if (user?.customerProfile?.address) {
      setAddress(user.customerProfile.address);
    }
  }, [user]);

  // Sync state to cart context
  useEffect(() => {
    if (date && slot) {
      setDeliveryInfo(date, slot);
    }
  }, [date, slot]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      // Trigger login modal
      router.push(`/checkout?auth=signin&redirect=/checkout`);
      return;
    }

    if (!address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchenId,
          items: cartItems.map(ci => ({ menuItemId: ci.menuItemId, quantity: ci.quantity })),
          deliveryDate: date,
          deliverySlot: slot,
          deliveryAddress: address,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to place order.');
      } else {
        setSuccessOrder(data.order);
        clearCart();
      }
    } catch (err) {
      setError('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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

  // Success view
  if (successOrder) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-16 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-brand-primary flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-extrabold text-brand-dark">You're all set.</h1>
              <p className="text-xs text-brand-gray">Your payment was verified and demand has been confirmed with {kitchenName}.</p>
            </div>
            
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-left text-xs text-brand-gray space-y-2 font-medium">
              <p><strong>Order ID:</strong> <span className="text-brand-dark">{successOrder.id}</span></p>
              <p><strong>Kitchen:</strong> <span className="text-brand-dark">{kitchenName}</span></p>
              <p><strong>Delivery Date:</strong> <span className="text-brand-dark">{new Date(successOrder.deliveryDate).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span></p>
              <p><strong>Delivery Window:</strong> <span className="text-brand-dark">{successOrder.deliverySlot}</span></p>
            </div>

            <div className="pt-4">
              <Link
                href={`/order-tracking/${successOrder.id}`}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-center font-semibold text-xs py-3 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                Track Live Order
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AuthModal />

      <main className="flex-1 bg-[#FBFBF9] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            <Link href="/explore" className="text-xs font-semibold text-brand-gray hover:text-brand-dark flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to explore
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Side: Checkout Form */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Check for empty cart */}
              {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 space-y-4">
                  <ShoppingBag className="h-10 w-10 text-zinc-300 mx-auto" />
                  <h2 className="font-display text-lg font-bold text-brand-dark">No orders yet.</h2>
                  <p className="text-xs text-brand-gray">Your cart is empty. Explore kitchens and select your batch meals.</p>
                  <Link
                    href="/explore"
                    className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm"
                  >
                    Browse Kitchens
                  </Link>
                </div>
              ) : (
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                  {/* Error Notification */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex gap-3 text-xs font-semibold">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                      <div>
                        <p className="font-bold text-brand-dark">Checkout Blocked</p>
                        <p className="mt-0.5">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Delivery Address */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                      <MapPin className="h-4.5 w-4.5 text-brand-primary" />
                      1. Delivery Address
                    </h3>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Address Details</label>
                      <textarea
                        required
                        placeholder="Apartment number, street address, area code..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all h-20 resize-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Step 2: Date & Slot Selectors */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                      <Clock className="h-4.5 w-4.5 text-brand-primary" />
                      2. Delivery Date & Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Date Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Delivery Date</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {availableDates.map((d) => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => setDate(d.value)}
                              className={`py-2 text-[10px] font-semibold border rounded-lg transition-all ${
                                date === d.value
                                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                                  : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slot Select */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-gray uppercase tracking-wider">Delivery Window</label>
                        <select
                          value={slot}
                          onChange={(e) => setSlot(e.target.value)}
                          className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white font-medium"
                        >
                          {slots.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Interactive Payment Gateway Simulator */}
                  <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-brand-dark flex items-center gap-2">
                      <CreditCard className="h-4.5 w-4.5 text-brand-primary" />
                      3. Interactive Payment Gateway
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === 'upi'
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                            : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                        }`}
                      >
                        <QrCode className="h-5 w-5" />
                        <span className="text-[10px]">UPI Scan & Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                            : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-[10px]">Credit / Debit Card</span>
                      </button>
                    </div>

                    {/* Interactive UI based on choice */}
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                      {paymentMethod === 'upi' ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                          <div className="h-20 w-20 bg-white border border-zinc-300 rounded-lg flex items-center justify-center p-1 relative">
                            <span className="text-[8px] bg-brand-primary text-white font-bold px-1 rounded absolute -top-2">TEST UPI</span>
                            <QrCode className="h-full w-full text-zinc-800" />
                          </div>
                          <div className="text-xs text-brand-gray space-y-1 font-medium">
                            <p className="font-bold text-brand-dark">Scan QR Code via PhonePe / GPay</p>
                            <p>Or use virtual address: <code>digitaldabba@paytm</code></p>
                            <p className="text-[10px] text-zinc-400">Mock simulation: clicking checkout will auto-verify this transaction.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-3 space-y-1">
                              <label className="text-[8px] font-bold text-brand-gray uppercase">Card Number</label>
                              <input type="text" placeholder="4111 2222 3333 4444" disabled className="w-full p-2 text-xs bg-zinc-100 border border-zinc-200 rounded font-mono" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-brand-gray uppercase">Expiry</label>
                              <input type="text" placeholder="12/28" disabled className="w-full p-2 text-xs bg-zinc-100 border border-zinc-200 rounded text-center" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-brand-gray uppercase">CVV</label>
                              <input type="password" placeholder="•••" disabled className="w-full p-2 text-xs bg-zinc-100 border border-zinc-200 rounded text-center" />
                            </div>
                          </div>
                          <p className="text-[9px] text-zinc-400 font-medium">Mock card details will auto-authenticate. Card billing is fully simulated for testing.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-sm py-4 rounded-xl shadow-lg shadow-brand-primary/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Pay & Place Order (₹{cartTotal + 40})</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Side: Order Summary Panel */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm space-y-4">
                <h3 className="font-display font-bold text-sm text-brand-dark pb-3 border-b border-zinc-100">
                  Order Summary
                </h3>

                <div className="space-y-3">
                  {cartItems.map((ci) => (
                    <div key={ci.menuItemId} className="flex justify-between items-start text-xs font-semibold text-brand-dark">
                      <div>
                        <p>{ci.name}</p>
                        <p className="text-[10px] text-brand-gray font-medium">Quantity: {ci.quantity}</p>
                      </div>
                      <span>₹{ci.price * ci.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 pt-3 space-y-1.5 text-xs text-brand-gray font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-zinc-100 pt-1.5">
                    <span>Total Bill</span>
                    <span>₹{cartTotal + 40}</span>
                  </div>
                </div>

                {kitchenName && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] text-brand-gray font-medium space-y-1.5">
                    <p className="font-bold text-brand-dark flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                      Digital Dabba Kitchen: {kitchenName}
                    </p>
                    <p>Cooking is triggered tomorrow based on exact manifest demand. Zero food waste model.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
