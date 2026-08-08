'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  CheckCircle, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  ClipboardList, 
  ChefHat, 
  Truck, 
  Smile,
  ShieldCheck,
  TrendingUp,
  XCircle,
  Percent
} from 'lucide-react';

export default function Home() {
  // Steps for the operational flywheel animation
  const steps = [
    { icon: ShoppingBag, label: 'Order', color: 'bg-zinc-100 text-zinc-600' },
    { icon: CreditCard, label: 'Payment', color: 'bg-zinc-100 text-zinc-600' },
    { icon: Clock, label: '9 PM Cutoff', color: 'bg-amber-100 text-amber-600 border border-amber-200' },
    { icon: ClipboardList, label: 'Manifest', color: 'bg-emerald-100 text-emerald-600 border border-emerald-200' },
    { icon: ChefHat, label: 'Cook', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Truck, label: 'Route Deliver', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Smile, label: 'Fresh Food', color: 'bg-emerald-500 text-white shadow-md' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-[#FBFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Hyperlocal Food Operating System
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-dark leading-none"
              >
                Cook What’s <span className="text-brand-primary">Sold</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg sm:text-xl text-brand-gray max-w-xl mx-auto lg:mx-0 font-medium"
              >
                Fresh meals prepared from confirmed orders — not forecasts. Less waste, better food, and zero commission markups.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-sm px-6 py-3.5 rounded-lg shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/10 transition-all group"
                >
                  Order Fresh Food
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/explore?auth=signup&role=kitchen"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-dark hover:bg-brand-dark-light text-white font-semibold text-sm px-6 py-3.5 rounded-lg transition-all"
                >
                  List Your Kitchen
                </Link>
              </motion.div>

              {/* Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 border-t border-zinc-200/60"
              >
                <div>
                  <p className="text-xl font-bold text-brand-dark">0%</p>
                  <p className="text-[10px] text-brand-gray font-medium uppercase tracking-wider">Food Waste</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-brand-dark">₹0</p>
                  <p className="text-[10px] text-brand-gray font-medium uppercase tracking-wider">Discovery Fees</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-brand-dark">100%</p>
                  <p className="text-[10px] text-brand-gray font-medium uppercase tracking-wider">Pre-ordered Freshness</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Dynamic Flywheel Animation */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-50/50 rounded-full blur-xl" />
                
                <h3 className="font-display font-bold text-sm text-brand-dark mb-4 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping" />
                  The Demand-Driven Cycle
                </h3>

                <div className="space-y-3 relative">
                  {/* Vertical line connecting steps */}
                  <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-zinc-100" />
                  
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-4 relative z-10"
                      >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-brand-dark">{step.label}</p>
                        </div>
                        {idx === 2 && (
                          <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                            9:00 PM
                          </span>
                        )}
                        {idx === 3 && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                            231 meals locked
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark">
              How It Works
            </h2>
            <p className="text-brand-gray font-medium">
              We align food production directly with customer demand, creating a seamless fresh-food cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="space-y-3 relative p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all bg-[#FBFBF9]/40">
              <span className="text-3xl font-extrabold text-zinc-200 font-display">01</span>
              <h3 className="text-base font-bold text-brand-dark">Choose</h3>
              <p className="text-xs text-brand-gray leading-relaxed font-medium">
                Choose a verified local kitchen and select your custom menu meals for tomorrow or the upcoming week.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="space-y-3 relative p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all bg-[#FBFBF9]/40">
              <span className="text-3xl font-extrabold text-zinc-200 font-display">02</span>
              <h3 className="text-base font-bold text-brand-dark">Pre-order</h3>
              <p className="text-xs text-brand-gray leading-relaxed font-medium">
                Place your order and check out before the kitchen's 9 PM cutoff. Your booking guarantees production.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all bg-[#FBFBF9]/40">
              <span className="text-3xl font-extrabold text-zinc-200 font-display">03</span>
              <h3 className="text-base font-bold text-brand-dark">We Prepare</h3>
              <p className="text-xs text-brand-gray leading-relaxed font-medium">
                The kitchen purchases raw ingredients and cooks only the confirmed quantity. Zero leftovers, absolute freshness.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all bg-[#FBFBF9]/40">
              <span className="text-3xl font-extrabold text-zinc-200 font-display">04</span>
              <h3 className="text-base font-bold text-brand-dark">Fresh Delivery</h3>
              <p className="text-xs text-brand-gray leading-relaxed font-medium">
                Orders are clustered by route for efficient delivery right to your doorstep. Track status in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We're Different */}
      <section className="py-20 bg-[#FBFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Operational Comparison
            </span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark">
              Why We're Different
            </h2>
            <p className="text-brand-gray font-medium">
              We optimize food production itself, not just discovery.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-brand-dark uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Feature</th>
                  <th className="p-4 sm:p-5 text-red-600 bg-red-50/20">On-Demand Aggregators</th>
                  <th className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/30">Digital Dabba OS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-zinc-100 font-medium">
                <tr>
                  <td className="p-4 sm:p-5 text-brand-dark">Food Waste %</td>
                  <td className="p-4 sm:p-5 text-red-600 bg-red-50/10">30% - 40% (unsold leftovers)</td>
                  <td className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/20">0% (cook-what's-sold)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 text-brand-dark">Ingredient Quality</td>
                  <td className="p-4 sm:p-5 text-zinc-600">Stored long-term or frozen to cushion waste</td>
                  <td className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/20">Bought fresh daily based on lock manifest</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 text-brand-dark">Kitchen Fees</td>
                  <td className="p-4 sm:p-5 text-zinc-600">25-35% high percentage commissions</td>
                  <td className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/20">Predictable monthly SaaS subscription</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 text-brand-dark">Customer Markups</td>
                  <td className="p-4 sm:p-5 text-red-600 bg-red-50/10">Inflated menu prices to cover commissions</td>
                  <td className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/20">Direct-to-kitchen pricing (lower costs)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 text-brand-dark">Delivery Efficiency</td>
                  <td className="p-4 sm:p-5 text-zinc-600">Point-to-point chaotic routing</td>
                  <td className="p-4 sm:p-5 text-emerald-700 bg-emerald-50/20">Geographical cluster delivery (low cost)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Value Prop for Customers */}
      <section className="py-20 bg-white border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-brand-accent uppercase tracking-widest bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
                For Customers
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark">
                Know what's coming before it reaches your door.
              </h2>
              <p className="text-brand-gray font-medium">
                Subscribe to weekly menus or pre-order individual meals. Enjoy fresh, healthy home cooking from verified local cloud kitchens that cook exclusively for you.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Pre-ordered fresh daily preparation
                </li>
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Verified local kitchens only (hygiene checked)
                </li>
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Flexible subscription pauses & cancellation
                </li>
              </ul>
              <div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all"
                >
                  Explore Kitchens
                </Link>
              </div>
            </div>
            
            {/* Visual element */}
            <div className="lg:col-span-7 bg-[#FBFBF9] border border-zinc-200/80 p-8 rounded-2xl shadow-inner relative flex items-center justify-center min-h-[300px]">
              <div className="space-y-4 w-full max-w-md">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 relative">
                    <img src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=120" alt="Meal" className="object-cover h-full w-full" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-brand-dark">HomeBowl Chicken Thali</h4>
                    <p className="text-[10px] text-brand-gray font-medium">Delivering Tomorrow at 12:30 PM</p>
                  </div>
                  <span className="text-xs font-bold text-brand-primary bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                    Confirmed
                  </span>
                </div>
                
                {/* Visual timeline */}
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-brand-dark">Preparation Timeline</h4>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="text-[10px] font-semibold text-brand-primary">
                      <div className="h-1 bg-brand-primary rounded mb-1" />
                      Ordered
                    </div>
                    <div className="text-[10px] font-semibold text-brand-primary">
                      <div className="h-1 bg-brand-primary rounded mb-1" />
                      Locked (9PM)
                    </div>
                    <div className="text-[10px] font-semibold text-brand-gray">
                      <div className="h-1 bg-zinc-200 rounded mb-1" />
                      Preparing
                    </div>
                    <div className="text-[10px] font-semibold text-brand-gray">
                      <div className="h-1 bg-zinc-200 rounded mb-1" />
                      Delivered
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop for Kitchens */}
      <section className="py-20 bg-[#FBFBF9]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual element */}
            <div className="lg:col-span-7 order-last lg:order-first bg-white border border-zinc-200 p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Tomorrow's Production Plan</h4>
                  <h3 className="text-xl font-extrabold text-brand-dark">231 Meals Sold</h3>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                  100% Demand Confirmed
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-brand-gray font-semibold uppercase">Chicken Thali</p>
                  <p className="text-xl font-bold text-brand-dark">87 orders</p>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                  <p className="text-[10px] text-brand-gray font-semibold uppercase">Veg Thali</p>
                  <p className="text-xl font-bold text-brand-dark">64 orders</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-800">Ingredients needed calculated dynamically</span>
                <span className="font-bold text-brand-primary">Ready</span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                For Kitchens
              </span>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-brand-dark">
                Your Kitchen. Your Customers. Your Margin.
              </h2>
              <p className="text-brand-gray font-medium">
                Run direct pre-orders, inventory manifests, and routing clusters from one integrated SaaS dashboard. Shift from unpredictable marketplace commissions to direct customer ownership.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Exact production manifest updates at cutoff
                </li>
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Automatic ingredient shortfall calculations
                </li>
                <li className="flex items-center gap-2.5 text-sm text-brand-dark font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 text-brand-primary" />
                  Geographical cluster dispatch maps
                </li>
              </ul>
              <div>
                <Link
                  href="/explore?auth=signup&role=kitchen"
                  className="inline-flex items-center gap-2 bg-brand-dark hover:bg-brand-dark-light text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-md transition-all"
                >
                  Start Your Kitchen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Trust Statistics */}
      <section className="py-16 bg-[#121212] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="font-display text-2xl sm:text-3xl font-bold">Trusted Local Food Network</h2>
            <p className="text-zinc-500 text-sm font-medium">Live verified platform performance indicators</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">25,000+</p>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Meals Delivered</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">98.2%</p>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Successful Deliveries</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">4.7/5</p>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Average Rating</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-brand-primary">150+</p>
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Verified Kitchens</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
