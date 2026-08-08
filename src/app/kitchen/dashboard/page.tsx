'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { 
  ChefHat, 
  ShoppingBag, 
  ClipboardList, 
  Package, 
  Truck, 
  Settings, 
  Star, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function KitchenDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'production' | 'inventory' | 'orders' | 'delivery' | 'settings'>('overview');
  const [kpis, setKpis] = useState<any>({ todayOrders: 0, tomorrowOrders: 0, todayRevenue: 0, pendingOrders: 0, repeatRate: 0, wastePercent: 0.0 });
  const [manifest, setManifest] = useState<any>({ totalMeals: 0, items: [] });
  const [inventory, setInventory] = useState<any[]>([]);
  const [deliveryClusters, setDeliveryClusters] = useState<any[]>([]);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [onlineStatus, setOnlineStatus] = useState(true);
  
  // Settings cutoff config state
  const [cutoffTime, setCutoffTime] = useState('21:00');

  // Inventory adjustment state
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [availableQty, setAvailableQty] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('kg');
  const [invSaving, setInvSaving] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/kitchen/dashboard');
      const data = await res.json();
      if (!res.ok) throw new Error();
      
      if (data.kpis) setKpis(data.kpis);
      if (data.manifest) setManifest(data.manifest);
      if (data.inventory) setInventory(data.inventory);
      if (data.deliveryClusters) setDeliveryClusters(data.deliveryClusters);
    } catch (e) {
      console.error('Failed to load dashboard metrics');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    await Promise.all([fetchDashboardData(), fetchOrders()]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      loadAllData(true);
      if (user.kitchenProfile?.cutoffTime) {
        setCutoffTime(user.kitchenProfile.cutoffTime);
      }
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleStatusTransition = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await loadAllData(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !availableQty) return;
    
    setInvSaving(true);
    try {
      const res = await fetch('/api/kitchen/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientName: selectedIngredient,
          availableQty: parseFloat(availableQty),
          unit: ingredientUnit,
        }),
      });

      if (res.ok) {
        await fetchDashboardData();
        setAvailableQty('');
        setSelectedIngredient('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInvSaving(false);
    }
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

  // Redirect if Guest or not KITCHEN role
  if (!user || user.role !== 'KITCHEN') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <ChefHat className="h-10 w-10 text-zinc-300 mx-auto" />
            <h2 className="font-display text-lg font-bold text-brand-dark">SaaS Dashboard Access Restricted</h2>
            <p className="text-xs text-brand-gray">Please sign in with a registered Kitchen partner account to open the Operating System.</p>
            <Link href="/explore?auth=signin&role=kitchen" className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm">
              Sign In as Kitchen
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Pending Onboarding wizard redirect
  if (user.kitchenProfile?.status === 'PENDING_ONBOARDING') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <Layers className="h-10 w-10 text-brand-primary mx-auto animate-pulse" />
            <h2 className="font-display text-lg font-bold text-brand-dark">Complete Kitchen Onboarding</h2>
            <p className="text-xs text-brand-gray">You must complete your business verification and select a subscription plan before listing your kitchen LIVE.</p>
            <Link href="/kitchen/onboarding" className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm">
              Start Onboarding Wizard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Under Verification Redirect
  if (user.kitchenProfile?.status === 'PENDING_VERIFICATION') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <Clock className="h-10 w-10 text-brand-accent mx-auto" />
            <h2 className="font-display text-lg font-bold text-brand-dark">Verification in Progress</h2>
            <p className="text-xs text-brand-gray">Your profile and mock documents are submitted. Platform admin review is pending. We will notify you once approved.</p>
            <button onClick={() => window.location.reload()} className="inline-flex bg-zinc-800 text-white font-semibold text-xs px-6 py-3 rounded-lg">
              Check Review Status
            </button>
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

      <main className="flex-1 bg-[#FBFBF9] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Operational Bar */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-brand-dark">{user.kitchenProfile?.name} OS</h1>
                <p className="text-[10px] text-brand-gray font-medium">Cutoff: {cutoffTime} PM • Hyperlocal Zone: HSR Layout</p>
              </div>
            </div>

            {/* Online Status Switch */}
            <div className="flex items-center gap-4 self-end md:self-auto">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${onlineStatus ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-xs font-bold text-brand-dark">{onlineStatus ? 'Online & Taking Orders' : 'Offline'}</span>
              </div>
              <button
                onClick={() => setOnlineStatus(!onlineStatus)}
                className={`text-[10px] font-bold border px-3 py-1.5 rounded-lg transition-all ${
                  onlineStatus ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-brand-primary border-emerald-200'
                }`}
              >
                Go {onlineStatus ? 'Offline' : 'Online'}
              </button>
              <button
                onClick={() => loadAllData(false)}
                title="Refresh stats"
                className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50"
              >
                <RefreshCw className="h-3.5 w-3.5 text-brand-gray" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Sidebar OS Navigation */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-zinc-200 p-4 space-y-1 shadow-sm font-semibold">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'overview' ? 'bg-brand-primary/10 text-brand-primary font-extrabold' : 'text-brand-gray hover:bg-zinc-50'}`}>
                  <TrendingUp className="h-4 w-4" /> Overview & KPIs
                </button>
                <button onClick={() => setActiveTab('production')} className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-between ${activeTab === 'production' ? 'bg-brand-primary/10 text-brand-primary font-extrabold' : 'text-brand-gray hover:bg-zinc-50'}`}>
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Production Manifest
                  </span>
                  {manifest.totalMeals > 0 && (
                    <span className="text-[9px] bg-brand-primary text-white font-extrabold px-1.5 py-0.5 rounded-full">{manifest.totalMeals}</span>
                  )}
                </button>
                <button onClick={() => setActiveTab('inventory')} className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-between ${activeTab === 'inventory' ? 'bg-brand-primary/10 text-brand-primary font-extrabold' : 'text-brand-gray hover:bg-zinc-50'}`}>
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" /> Inventory Control
                  </span>
                  {inventory.filter(i => i.status === 'SHORT').length > 0 && (
                    <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">{inventory.filter(i => i.status === 'SHORT').length} alert</span>
                  )}
                </button>
                <button onClick={() => setActiveTab('orders')} className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-brand-primary/10 text-brand-primary font-extrabold' : 'text-brand-gray hover:bg-zinc-50'}`}>
                  <ShoppingBag className="h-4 w-4" /> Order Manager ({orders.length})
                </button>
                <button onClick={() => setActiveTab('delivery')} className={`w-full text-left py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'delivery' ? 'bg-brand-primary/10 text-brand-primary font-extrabold' : 'text-brand-gray hover:bg-zinc-50'}`}>
                  <Truck className="h-4 w-4" /> Delivery Router
                </button>
              </div>
            </div>

            {/* Right: Tab Contents */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Tab 1: Overview KPIs */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm space-y-1">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">Today's Orders</p>
                      <p className="text-2xl font-extrabold text-brand-dark">{kpis.todayOrders}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm space-y-1">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">Tomorrow's Confirmed Orders</p>
                      <p className="text-2xl font-extrabold text-brand-dark">{kpis.tomorrowOrders}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm space-y-1">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">Today's Revenue</p>
                      <p className="text-2xl font-extrabold text-brand-dark">₹{kpis.todayRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm space-y-1">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">Pending Orders</p>
                      <p className="text-2xl font-extrabold text-brand-dark">{kpis.pendingOrders}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm space-y-1">
                      <p className="text-[10px] text-brand-gray uppercase font-bold tracking-wider">Repeat Customers</p>
                      <p className="text-2xl font-extrabold text-brand-dark">{kpis.repeatRate}</p>
                    </div>
                    <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-sm space-y-1 bg-emerald-50/20">
                      <p className="text-[10px] text-brand-primary uppercase font-bold tracking-wider">Food Waste %</p>
                      <p className="text-2xl font-extrabold text-brand-primary">0.0%</p>
                      <p className="text-[8px] text-zinc-400 font-bold">Cook what is sold model</p>
                    </div>
                  </div>

                  {/* Operational Flywheel Explanation */}
                  <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-3">
                    <h3 className="font-display font-extrabold text-sm text-brand-dark">Operating Principle: "Cook What Is Sold"</h3>
                    <p className="text-xs text-brand-gray leading-relaxed font-medium">
                      Traditional kitchens guess demand, buy stock, cook meals, and deal with unsold inventory. Digital Dabba reverses this loop. Orders lock at 9:00 PM. Raw ingredients are purchased against the exact manifest counts. Cooking begins against actual demand. Waste is zeroed out, and margins are maximized.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Production Manifest */}
              {activeTab === 'production' && (
                <div className="space-y-6">
                  {/* Visual Showcase Header */}
                  <div className="bg-[#121212] rounded-2xl text-white p-6 relative overflow-hidden shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1 relative z-10">
                      <h2 className="font-display text-xl sm:text-2xl font-extrabold">Tomorrow's Production Manifest</h2>
                      <p className="text-xs text-zinc-400 font-medium">Locked confirmed demand for next-day delivery</p>
                    </div>
                    <div className="bg-brand-primary text-white border border-emerald-500 font-extrabold text-base px-5 py-3 rounded-xl shadow-md shrink-0 self-start text-center">
                      <p className="text-2xl font-black">{manifest.totalMeals}</p>
                      <p className="text-[9px] uppercase tracking-wider font-bold">PAID MEALS TO COOK</p>
                    </div>
                  </div>

                  {/* Production Items list */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* Meal Breakdowns */}
                    <div className="md:col-span-7 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Itemized Quantities</h3>
                      {manifest.items.length === 0 ? (
                        <p className="text-xs text-zinc-400">No orders logged for tomorrow's manifest yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {manifest.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-zinc-50 text-xs font-semibold text-brand-dark">
                              <span>{item.itemName}</span>
                              <span className="bg-zinc-100 text-brand-dark px-2.5 py-1 rounded font-bold">{item.quantity} orders</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Ingredients aggregation */}
                    <div className="md:col-span-5 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Ingredient Breakdown</h3>
                      <div className="space-y-2">
                        {inventory.filter(i => i.requiredQty > 0).map((i: any) => (
                          <div key={i.id} className="flex justify-between text-xs font-semibold text-brand-dark">
                            <span>{i.ingredientName}</span>
                            <span>{i.requiredQty} {i.unit}</span>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => alert('Manifest locked. Production manifests exported to kitchen printer!')}
                        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm mt-4"
                      >
                        Generate Production Plan
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Inventory Control */}
              {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left: Inventory levels */}
                  <div className="md:col-span-8 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Procurement & Inventory Levels</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-semibold text-brand-dark">
                        <thead>
                          <tr className="border-b border-zinc-200 text-brand-gray uppercase">
                            <th className="py-2">Ingredient</th>
                            <th className="py-2">Required</th>
                            <th className="py-2">Available</th>
                            <th className="py-2">Shortfall</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 font-medium">
                          {inventory.map((i) => (
                            <tr key={i.id}>
                              <td className="py-3 font-bold">{i.ingredientName}</td>
                              <td className="py-3">{i.requiredQty} {i.unit}</td>
                              <td className="py-3">{i.availableQty} {i.unit}</td>
                              <td className="py-3 text-red-600 font-bold">{i.shortfall > 0 ? `${i.shortfall} ${i.unit}` : '-'}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  i.status === 'SHORT'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-emerald-50 text-brand-primary'
                                }`}>
                                  {i.status === 'SHORT' ? 'SHORT' : 'READY'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Adjust available Stock */}
                  <div className="md:col-span-4 bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-brand-gray uppercase tracking-wider">Update Stock Levels</h3>
                    <form onSubmit={handleUpdateInventory} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-gray uppercase">Ingredient Name</label>
                        <select
                          required
                          value={selectedIngredient}
                          onChange={(e) => setSelectedIngredient(e.target.value)}
                          className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                        >
                          <option value="">Select ingredient</option>
                          <option value="Chicken">Chicken</option>
                          <option value="Rice">Rice</option>
                          <option value="Paneer">Paneer</option>
                          <option value="Vegetables">Vegetables</option>
                          <option value="Packaging Boxes">Packaging Boxes</option>
                          <option value="Oats">Oats</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-gray uppercase">Available Stock Qty</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            step="0.1"
                            required
                            placeholder="12.0"
                            value={availableQty}
                            onChange={(e) => setAvailableQty(e.target.value)}
                            className="w-full p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                          />
                          <select
                            value={ingredientUnit}
                            onChange={(e) => setIngredientUnit(e.target.value)}
                            className="p-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none"
                          >
                            <option value="kg">kg</option>
                            <option value="units">units</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={invSaving}
                        className="w-full bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        {invSaving ? (
                          <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Update Stock</>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab 4: Order Manager */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="font-display text-sm font-bold text-brand-dark">Manage Fulfillments</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
                      <p className="text-xs text-brand-gray font-semibold">No orders logged.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-200 text-brand-gray uppercase font-bold">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Items</th>
                            <th className="p-3">Slot</th>
                            <th className="p-3 text-right">Amount</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-semibold text-brand-dark">
                          {orders.map((o) => (
                            <tr key={o.id} className="hover:bg-zinc-50/50">
                              <td className="p-3 font-mono text-[10px]">{o.id.slice(0, 8)}</td>
                              <td className="p-3">
                                <p>{o.customer.user.name}</p>
                                <p className="text-[9px] text-brand-gray font-medium">{o.customer.user.phone}</p>
                              </td>
                              <td className="p-3">
                                {o.items.map((i: any) => `${i.name} (x${i.quantity})`).join(', ')}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <p>{new Date(o.deliveryDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                                <p className="text-[9px] text-brand-gray font-medium">{o.deliverySlot}</p>
                              </td>
                              <td className="p-3 text-right">₹{o.total}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.status === 'DELIVERED'
                                    ? 'bg-emerald-50 text-brand-primary'
                                    : o.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-brand-primary/10 text-brand-primary'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {o.status === 'CONFIRMED' && (
                                  <button
                                    disabled={updatingId === o.id}
                                    onClick={() => handleStatusTransition(o.id, 'PREPARING')}
                                    className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-primary-hover transition-colors"
                                  >
                                    Start Prep
                                  </button>
                                )}
                                {o.status === 'PREPARING' && (
                                  <button
                                    disabled={updatingId === o.id}
                                    onClick={() => handleStatusTransition(o.id, 'PACKED')}
                                    className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-primary-hover transition-colors"
                                  >
                                    Pack Meal
                                  </button>
                                )}
                                {o.status === 'PACKED' && (
                                  <button
                                    disabled={updatingId === o.id}
                                    onClick={() => handleStatusTransition(o.id, 'OUT_FOR_DELIVERY')}
                                    className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-primary-hover transition-colors"
                                  >
                                    Dispatch
                                  </button>
                                )}
                                {o.status === 'OUT_FOR_DELIVERY' && (
                                  <button
                                    disabled={updatingId === o.id}
                                    onClick={() => handleStatusTransition(o.id, 'DELIVERED')}
                                    className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-primary-hover transition-colors"
                                  >
                                    Complete
                                  </button>
                                )}
                                {['DELIVERED', 'CANCELLED'].includes(o.status) && (
                                  <span className="text-[10px] text-zinc-400">Complete</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Delivery Management */}
              {activeTab === 'delivery' && (
                <div className="space-y-6">
                  {/* Delivery clusters grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deliveryClusters.map((c, idx) => (
                      <div key={idx} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-50 pb-2">
                          <h4 className="text-xs font-bold text-brand-dark flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-brand-primary" />
                            {c.zone}
                          </h4>
                          <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-bold">
                            {c.count} deliveries
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {c.orders.length === 0 ? (
                            <p className="text-[10px] text-zinc-400">No active dispatches for this zone.</p>
                          ) : (
                            c.orders.map((o: any) => (
                              <div key={o.id} className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200/60 text-[10px] text-brand-gray space-y-1 font-medium">
                                <div className="flex justify-between font-bold text-brand-dark">
                                  <span>ID: {o.id.slice(0, 8)}</span>
                                  <span>₹{o.total}</span>
                                </div>
                                <p className="line-clamp-2 leading-tight">Addr: {o.deliveryAddress}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Rider dispatcher dispatch */}
                  <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-brand-dark">Delivery Fleet Routing Optimizer</h4>
                      <p className="text-[10px] text-brand-gray">Group orders geographically to reduce travel cost by 45%.</p>
                    </div>
                    <button
                      onClick={() => alert('Route optimized! Dispatched riders with cluster route manifests.')}
                      className="bg-brand-dark hover:bg-brand-dark-light text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                      Dispatch Rider Fleet
                    </button>
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
