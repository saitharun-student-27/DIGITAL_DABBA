'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  ChefHat, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Users, 
  TrendingUp, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const [pendingKitchens, setPendingKitchens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  
  // Platform statistics mockup
  const stats = [
    { label: 'Total Meals Delivered', value: '25,482', icon: ShoppingBag, color: 'text-brand-primary bg-emerald-50' },
    { label: 'Platform Revenue', value: '₹37,84,200', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Kitchens', value: '154', icon: ChefHat, color: 'text-zinc-700 bg-zinc-100' },
    { label: 'Total Customers', value: '4,890', icon: Users, color: 'text-blue-600 bg-blue-50' }
  ];

  const fetchPendingKitchens = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();
      if (data.kitchens) {
        setPendingKitchens(data.kitchens);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchPendingKitchens();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleVerifyKitchen = async (kitchenId: string, approve: boolean) => {
    setApprovingId(kitchenId);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchenId, approve }),
      });

      if (res.ok) {
        alert(approve ? 'Kitchen approved successfully!' : 'Kitchen application rejected.');
        setPendingKitchens(prev => prev.filter(k => k.id !== kitchenId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApprovingId(null);
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

  // Restrict access
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <ShieldCheck className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="font-display text-lg font-bold text-brand-dark">Access Denied</h2>
            <p className="text-xs text-brand-gray">Platform administration panel. Please sign in with admin credentials.</p>
            <Link href="/explore?auth=signin" className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm">
              Log In as Admin
            </Link>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-zinc-800 text-white rounded-2xl flex items-center justify-center shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold text-brand-dark">Platform Admin Operations</h1>
              <p className="text-xs text-brand-gray font-medium">Verify kitchen listings, resolve disputes, and track platform-wide KPIs.</p>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-white border border-zinc-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] text-brand-gray uppercase font-bold tracking-wider">{s.label}</p>
                    <p className="text-lg font-extrabold text-brand-dark">{s.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Kitchens Pending Verification */}
          <div className="space-y-4">
            <h2 className="font-display text-base font-extrabold text-brand-dark flex items-center gap-1.5">
              Pending Kitchen Approvals
              <span className="h-2 w-2 rounded-full bg-brand-accent animate-pulse" />
            </h2>

            {pendingKitchens.length === 0 ? (
              <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
                <CheckCircle className="h-10 w-10 text-brand-primary mx-auto mb-3" />
                <h3 className="text-sm font-bold text-brand-dark">No pending approvals</h3>
                <p className="text-xs text-brand-gray mt-1">All onboarded kitchens are currently verified and active.</p>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-brand-gray uppercase font-bold">
                      <th className="p-4">Kitchen Name</th>
                      <th className="p-4">Chef Name</th>
                      <th className="p-4">Cuisine</th>
                      <th className="p-4">Contacts</th>
                      <th className="p-4">FSSAI Document</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-semibold text-brand-dark">
                    {pendingKitchens.map((k) => (
                      <tr key={k.id} className="hover:bg-zinc-50/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={k.logo || 'https://images.unsplash.com/photo-1581090464762-c283842c262c?auto=format&fit=crop&q=80&w=50'}
                              alt={k.name}
                              className="h-8 w-8 rounded-lg object-cover border border-zinc-200"
                            />
                            <span>{k.name}</span>
                          </div>
                        </td>
                        <td className="p-4">{k.user.name}</td>
                        <td className="p-4 font-medium text-brand-gray">{k.cuisine}</td>
                        <td className="p-4 font-medium text-brand-gray">
                          <p>{k.user.email}</p>
                          <p className="text-[10px]">{k.user.phone || '-'}</p>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => alert('FSSAI Certificate: Verified authenticity (simulated preview)')}
                            className="inline-flex items-center gap-1 text-[10px] text-brand-primary bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded"
                          >
                            <FileText className="h-3.5 w-3.5" /> FSSAI_License.pdf
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            disabled={approvingId === k.id}
                            onClick={() => handleVerifyKitchen(k.id, false)}
                            className="text-red-500 hover:bg-red-50 border border-red-100 p-1.5 rounded-lg transition-colors inline-flex items-center"
                            title="Reject Application"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            disabled={approvingId === k.id}
                            onClick={() => handleVerifyKitchen(k.id, true)}
                            className="text-brand-primary hover:bg-emerald-50 border border-emerald-100 p-1.5 rounded-lg transition-colors inline-flex items-center"
                            title="Approve & Go Live"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
