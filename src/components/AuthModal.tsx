'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { X, Mail, Lock, User, Phone, CheckCircle, ShieldCheck } from 'lucide-react';

function AuthModalInner() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const authMode = searchParams.get('auth'); // 'signin' | 'signup' | null
  const defaultRole = searchParams.get('role') || 'CUSTOMER'; // 'CUSTOMER' | 'KITCHEN'

  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'CUSTOMER' | 'KITCHEN'>('CUSTOMER');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authMode) {
      setIsOpen(true);
      setIsSignUp(authMode === 'signup');
      setRole(defaultRole as 'CUSTOMER' | 'KITCHEN');
      setError('');
    } else {
      setIsOpen(false);
    }
  }, [authMode, defaultRole]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Clear auth search params to close the modal
    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth');
    params.delete('role');
    router.push(pathname + (params.toString() ? `?${params.toString()}` : ''));
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const res = await register({ email, password, name, phone, role });
        if (!res.success) {
          setError(res.error || 'Registration failed');
        } else {
          handleSuccessRedirect();
        }
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Login failed');
        } else {
          handleSuccessRedirect();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    // Redirect based on role or previous checkout state
    const params = new URLSearchParams(searchParams.toString());
    params.delete('auth');
    params.delete('role');
    const redirectUrl = searchParams.get('redirect');
    
    // Refresh page or push to correct dashboard
    if (redirectUrl) {
      router.push(redirectUrl);
    } else if (role === 'KITCHEN' || (!isSignUp && user?.role === 'KITCHEN')) {
      // If it's a kitchen signing up, go to onboarding. If signing in, go to dashboard or onboarding depending on profile status.
      // We will redirect to /explore first, which will auto-check and redirect if onboarding is pending.
      // Wait, let's redirect directly:
      router.push('/explore');
    } else {
      router.push('/explore');
    }
    
    // Force refresh the auth state
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-brand-gray hover:text-brand-dark rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="font-display text-2xl font-extrabold text-brand-dark">
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-brand-gray font-medium">
            {isSignUp ? 'Select your role to start cooking or ordering' : 'Log in to manage orders & operating manifests'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg font-semibold border border-red-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              {error}
            </div>
          )}

          {/* Role selector (only on signup) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-brand-gray hover:text-brand-dark'
                }`}
              >
                I want to Order
              </button>
              <button
                type="button"
                onClick={() => setRole('KITCHEN')}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  role === 'KITCHEN'
                    ? 'bg-white text-brand-dark shadow-sm'
                    : 'text-brand-gray hover:text-brand-dark'
                }`}
              >
                I run a Kitchen
              </button>
            </div>
          )}

          {/* Name Field (only on signup) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Rahul Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Phone Field (only on signup) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold text-sm py-3 rounded-lg shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center mt-6 text-xs text-brand-gray font-medium">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError('');
                }}
                className="text-brand-primary font-bold hover:underline"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError('');
                }}
                className="text-brand-primary font-bold hover:underline"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Test Accounts Tip */}
        <div className="mt-4 p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[10px] text-brand-gray space-y-1">
          <p className="font-bold text-brand-dark flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-brand-primary" />
            Hackathon Demo Logins:
          </p>
          <p><strong>Customer:</strong> customer@digitaldabba.com / password123</p>
          <p><strong>Kitchen:</strong> kitchen@digitaldabba.com / password123</p>
          <p><strong>Admin:</strong> admin@digitaldabba.com / password123</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
