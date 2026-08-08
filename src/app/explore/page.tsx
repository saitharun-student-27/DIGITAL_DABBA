'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Search, Star, Clock, CheckCircle2, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
}

export default function Explore() {
  const { user } = useAuth();
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: '', label: 'All Meals' },
    { id: 'lunch', label: 'Lunch Specials' },
    { id: 'dinner', label: 'Dinner Feasts' },
    { id: 'healthy', label: 'Healthy & Lite' },
    { id: 'budget', label: 'Budget Bowls' },
    { id: 'family', label: 'Family Meals' },
  ];

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      let url = '/api/kitchens';
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.kitchens) {
        setKitchens(data.kitchens);
      }
    } catch (e) {
      console.error('Failed to fetch kitchens:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AuthModal />

      <main className="flex-1 bg-[#FBFBF9] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header/Promo Section */}
          <div className="bg-brand-dark rounded-2xl text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 h-40 w-40 bg-brand-primary/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 bg-brand-accent/10 rounded-full blur-xl" />
            
            <div className="relative max-w-xl space-y-4">
              <span className="inline-flex items-center gap-1 bg-brand-primary/20 border border-brand-primary/30 text-brand-primary-light px-2.5 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="h-3 w-3 animate-spin" />
                Hyperlocal fresh delivery
              </span>
              <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                What are you hungry for?
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium">
                Fresh meals prepared by verified home chefs based on confirmed pre-orders. Zero food waste, direct margins, ultimate taste.
              </p>
            </div>
          </div>

          {/* Search & Location Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-gray pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search meals, cuisines or kitchens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
              />
            </div>

            {/* Location selector */}
            <div className="flex items-center gap-1.5 text-xs text-brand-gray bg-white border border-zinc-200 px-4 py-2.5 rounded-xl shadow-sm self-stretch sm:self-auto justify-center">
              <MapPin className="h-4 w-4 text-brand-primary" />
              <span>Delivering to <strong className="text-brand-dark">HSR Layout, Bangalore</strong></span>
            </div>
          </div>

          {/* Categories Tab Row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-semibold px-4 py-2.5 rounded-full border transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/10'
                    : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Kitchens Grid */}
          <div className="space-y-6">
            <h2 className="font-display text-lg font-bold text-brand-dark flex items-center gap-1.5">
              Verified Kitchens
              <span className="h-2 w-2 rounded-full bg-brand-primary" />
            </h2>

            {loading ? (
              // Loading Skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm animate-pulse space-y-4 p-4 h-[300px]">
                    <div className="h-40 bg-zinc-200 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 rounded w-2/3" />
                      <div className="h-3 bg-zinc-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : kitchens.length === 0 ? (
              // Empty State
              <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 max-w-md mx-auto space-y-4">
                <p className="text-sm font-semibold text-brand-dark">No kitchens found</p>
                <p className="text-xs text-brand-gray">Try adjusting your filters or search query to find kitchens in your area.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="text-xs font-semibold text-brand-primary underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              // Kitchen Cards Grid
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kitchens.map((k) => (
                  <Link
                    key={k.id}
                    href={`/kitchen/${k.id}`}
                    className="group rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex flex-col h-full"
                  >
                    {/* Cover image */}
                    <div className="relative h-44 w-full bg-zinc-100 overflow-hidden">
                      <img
                        src={k.coverImage || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600'}
                        alt={k.name}
                        className="object-cover h-full w-full group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-brand-dark shadow-sm border border-zinc-100 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-brand-accent" />
                        <span>Cutoff: {k.cutoffTime}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-brand-dark group-hover:text-brand-primary transition-colors flex items-center gap-1.5">
                            {k.name}
                            <span title="Verified Kitchen"><CheckCircle2 className="h-4 w-4 text-brand-primary fill-emerald-50" /></span>
                          </h3>
                          <p className="text-xs text-brand-gray font-medium mt-0.5">{k.cuisine}</p>
                        </div>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-brand-dark bg-zinc-50 border border-zinc-100 px-2 py-1 rounded">
                          <Star className="h-3.5 w-3.5 text-brand-accent fill-brand-accent" />
                          <span>{k.rating}</span>
                        </div>
                      </div>

                      {/* Trust badges & indicators */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-brand-gray font-semibold pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{k.successfulDeliveries.toLocaleString()} meals delivered</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                          <span>{k.onTimeRate}% on-time</span>
                        </div>
                      </div>

                      {/* View Menu CTA */}
                      <div className="pt-2 flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-brand-gray">Delivery: ₹{k.deliveryFee}</span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-brand-primary group-hover:translate-x-0.5 transition-transform">
                          View Menu
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
