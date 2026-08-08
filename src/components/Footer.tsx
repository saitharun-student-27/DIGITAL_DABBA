'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#121212] text-zinc-400 py-12 border-t border-zinc-900 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Slogan */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-display font-bold text-lg">
                D
              </span>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Digital<span className="text-brand-primary">Dabba</span>
              </span>
            </div>
            <p className="text-sm max-w-sm text-zinc-400">
              Fresh meals prepared from confirmed orders — not forecasts. Less waste. Better food. Better margins.
            </p>
            <div className="text-xs text-zinc-500 font-medium">
              © {new Date().getFullYear()} Digital Dabba Inc. All rights reserved.
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">For Customers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">Explore Kitchens</Link>
              </li>
              <li>
                <Link href="/explore?auth=signup" className="hover:text-white transition-colors">Create Account</Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">View Cart</Link>
              </li>
            </ul>
          </div>

          {/* For Kitchens */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">For Kitchens</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore?auth=signup&role=kitchen" className="hover:text-white transition-colors">List Your Kitchen</Link>
              </li>
              <li>
                <Link href="/kitchen/onboarding" className="hover:text-white transition-colors">Complete Onboarding</Link>
              </li>
              <li>
                <Link href="/kitchen/dashboard" className="hover:text-white transition-colors">Kitchen OS Login</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            Swiggy and Zomato optimize food discovery and delivery. <strong>We optimize food production itself.</strong>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-zinc-400">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
