'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  CheckCircle2, 
  ChefHat, 
  Package, 
  Truck, 
  Smile, 
  MapPin, 
  Phone,
  Star,
  MessageSquare,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryDate: string;
  deliverySlot: string;
  deliveryAddress: string;
  paymentId: string;
  rating?: number | null;
  reviewText?: string | null;
  confirmedAt?: string | null;
  preparingAt?: string | null;
  packedAt?: string | null;
  outForDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  kitchen: {
    id: string;
    name: string;
    logo: string;
    successfulDeliveries: number;
    rating: number;
    onTimeRate: number;
  };
  items: OrderItem[];
}

export default function OrderTracking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [foodRating, setFoodRating] = useState(5);
  const [packRating, setPackRating] = useState(5);
  const [delivRating, setDelivRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);

  const fetchOrderDetails = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const { id } = await params;
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        throw new Error('Order not found');
      }
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails(true);

    // Set up polling for real-time database updates (every 4 seconds)
    const interval = setInterval(() => {
      fetchOrderDetails(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text: reviewText,
          foodQualityRating: foodRating,
          packagingRating: packRating,
          deliveryRating: delivRating,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to submit review');
      } else {
        setReviewPosted(true);
        fetchOrderDetails(false); // Refresh order metrics
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
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

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FBFBF9] gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="font-semibold text-brand-dark">{error || 'Order tracking details not found'}</p>
          <Link href="/customer" className="text-sm font-semibold text-brand-primary underline">
            Go to My Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Determine stage index
  const stages = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2, text: 'Your order is confirmed and locked in production.', time: order.confirmedAt },
    { key: 'PREPARING', label: 'Preparing', icon: ChefHat, text: 'Chef is preparing your meal based on exact batch demand.', time: order.preparingAt },
    { key: 'PACKED', label: 'Packed', icon: Package, text: 'Your order is packed in eco-friendly boxes.', time: order.packedAt },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, text: 'Your order is out with a delivery rider in your sector.', time: order.outForDeliveryAt },
    { key: 'DELIVERED', label: 'Delivered', icon: Smile, text: 'Your fresh meal has arrived at your door.', time: order.deliveredAt },
  ];

  const currentStatusIndex = stages.findIndex(s => s.key === order.status);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-[#FBFBF9] py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
            <div>
              <Link href="/customer" className="text-xs font-semibold text-brand-gray hover:text-brand-dark flex items-center gap-1 mb-2">
                <ArrowLeft className="h-3 w-3" /> Back to My Orders
              </Link>
              <h1 className="font-display text-2xl font-extrabold text-brand-dark">Track Live Order</h1>
              <p className="text-xs text-brand-gray mt-0.5">Order ID: <span className="font-semibold text-brand-dark">{order.id}</span></p>
            </div>
            <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold px-3 py-1.5 rounded-lg text-xs self-start">
              Status: {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Status Timeline */}
            <div className="md:col-span-8 bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-8">
              <h2 className="text-sm font-bold text-brand-dark border-b border-zinc-100 pb-3 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-brand-primary" />
                Delivery Timeline
              </h2>

              <div className="space-y-6 relative">
                {/* Vertical line connector */}
                <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-zinc-100" />

                {stages.map((stage, idx) => {
                  const Icon = stage.icon;
                  const isCompleted = idx <= currentStatusIndex;
                  const isActive = idx === currentStatusIndex;
                  
                  return (
                    <div key={stage.key} className="flex gap-4 relative">
                      {/* Checkpoint icon */}
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 z-10 transition-all border ${
                        isCompleted
                          ? 'bg-brand-primary border-brand-primary text-white shadow-sm'
                          : 'bg-white border-zinc-200 text-brand-gray'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 pt-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`text-xs font-bold ${isCompleted ? 'text-brand-dark font-extrabold' : 'text-brand-gray'}`}>
                            {stage.label}
                          </h3>
                          {stage.time && (
                            <span className="text-[10px] text-zinc-400">
                              {new Date(stage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] ${isActive ? 'text-brand-primary font-bold' : 'text-brand-gray'}`}>
                          {stage.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rider card when out for delivery */}
              {order.status === 'OUT_FOR_DELIVERY' && (
                <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-200">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-brand-dark font-display border border-zinc-300">
                    RK
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-brand-dark">Ramesh Kumar</p>
                    <p className="text-[10px] text-brand-gray">Delivery Partner • Zone A Cluster Dispatch</p>
                  </div>
                  <a
                    href="tel:+919876543210"
                    className="p-2 bg-white border border-zinc-200 text-brand-gray hover:text-brand-dark hover:border-zinc-300 rounded-lg transition-colors shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Right: Order details & Review Form */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Order summary card */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="pb-3 border-b border-zinc-100 flex items-center gap-2">
                  <img
                    src={order.kitchen.logo || 'https://images.unsplash.com/photo-1581090464762-c283842c262c?auto=format&fit=crop&q=80&w=60'}
                    alt={order.kitchen.name}
                    className="h-6 w-6 rounded-md object-cover border border-zinc-200"
                  />
                  <h3 className="text-xs font-bold text-brand-dark">{order.kitchen.name} ✓</h3>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-xs font-semibold text-brand-dark">
                      <div>
                        <p>{item.name}</p>
                        <p className="text-[10px] text-brand-gray font-medium">Qty: {item.quantity}</p>
                      </div>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 pt-3 space-y-1.5 text-xs text-brand-gray font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{order.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-brand-dark border-t border-zinc-100 pt-1.5">
                    <span>Paid</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-brand-gray font-medium border-t border-zinc-100 space-y-1">
                  <p><strong>Deliver to:</strong> {order.deliveryAddress}</p>
                  <p><strong>Time Slot:</strong> {order.deliverySlot}</p>
                  <p><strong>Date:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* POST-DELIVERY FEEDBACK INTERFACE */}
              {order.status === 'DELIVERED' && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-md space-y-4 animate-in slide-in-from-bottom-5 duration-200">
                  <div className="flex items-center gap-1.5 text-brand-primary">
                    <Smile className="h-5 w-5" />
                    <h3 className="text-sm font-bold text-brand-dark">How was your meal?</h3>
                  </div>
                  
                  {reviewPosted || order.rating ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-semibold text-brand-primary">
                      Thank you! Your verified review has been posted, and kitchen trust stats have been recalculated.
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      
                      {/* Overall Rating */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-gray uppercase">Overall Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setRating(starVal)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star className={`h-6 w-6 ${starVal <= rating ? 'fill-brand-accent text-brand-accent' : 'text-zinc-200'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Detail Ratings */}
                      <div className="space-y-2 pt-2 border-t border-zinc-100 text-[10px] text-brand-gray font-bold uppercase space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Food Quality</span>
                            <span className="text-brand-primary">{foodRating}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={foodRating} onChange={(e) => setFoodRating(Number(e.target.value))} className="w-full accent-brand-primary h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Packaging</span>
                            <span className="text-brand-primary">{packRating}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={packRating} onChange={(e) => setPackRating(Number(e.target.value))} className="w-full accent-brand-primary h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Delivery Time</span>
                            <span className="text-brand-primary">{delivRating}/5</span>
                          </div>
                          <input type="range" min="1" max="5" value={delivRating} onChange={(e) => setDelivRating(Number(e.target.value))} className="w-full accent-brand-primary h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>

                      {/* Text Review */}
                      <div className="space-y-1 pt-2 border-t border-zinc-100">
                        <label className="text-[10px] font-bold text-brand-gray uppercase">Review Comments</label>
                        <textarea
                          placeholder="Food arrived hot and exactly on time. Loved the homestyle chicken curry!"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all h-16 resize-none font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        {submittingReview ? (
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Submit Verified Review'
                        )}
                      </button>
                    </form>
                  )}
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
