'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { 
  Building, 
  ChefHat, 
  FileText, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function KitchenOnboarding() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Business Details
  const [businessName, setBusinessName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  // Step 2: Kitchen Details
  const [kitchenName, setKitchenName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [cutoffTime, setCutoffTime] = useState('21:00');

  // Step 3: Documents
  const [documentsUploaded, setDocumentsUploaded] = useState(false);

  // Step 4: Delivery Area
  const [deliveryArea, setDeliveryArea] = useState<string[]>(['HSR Layout']);

  // Step 5: Plan selection
  const [selectedPlan, setSelectedPlan] = useState({ name: 'GROWTH', price: 2499 });

  // Step 6: Payment Info (Simulated card)
  const [cardNumber, setCardNumber] = useState('');

  const plans = [
    { name: 'STARTER', price: 999, desc: 'Ideal for small home kitchens starting out.' },
    { name: 'GROWTH', price: 2499, desc: 'Perfect for active kitchens scaling direct demand.' },
    { name: 'PRO', price: 4999, desc: 'For commercial kitchens with multiple delivery fleets.' }
  ];

  const availableAreas = ['HSR Layout', 'Koramangala', 'Bellandur', 'Sarjapur Road', 'Whitefield', 'Indiranagar'];

  useEffect(() => {
    // If user is already active, direct to dashboard
    if (user?.kitchenProfile?.status === 'ACTIVE') {
      router.push('/kitchen/dashboard');
    }
  }, [user]);

  const handleNextStep = () => {
    setError('');
    
    // Step validation checks
    if (step === 1 && (!businessName || !panNumber)) {
      setError('Please fill in required business fields.');
      return;
    }
    if (step === 2 && (!kitchenName || !cuisine)) {
      setError('Please fill in required kitchen details.');
      return;
    }
    if (step === 3 && !documentsUploaded) {
      setError('Please upload simulated registration documents to continue.');
      return;
    }
    if (step === 4 && deliveryArea.length === 0) {
      setError('Select at least one delivery area zone.');
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleToggleArea = (area: string) => {
    setDeliveryArea(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/kitchen/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          panNumber,
          gstNumber,
          kitchenName,
          cuisine,
          description,
          cutoffTime,
          deliveryArea,
          planName: selectedPlan.name,
          planPrice: selectedPlan.price,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit onboarding.');
      } else {
        // Refresh auth state to update kitchenProfile details
        await refreshUser();
        setStep(7); // Show verification screen
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

  // Guest Redirect
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-20 flex items-center justify-center">
          <div className="text-center p-8 bg-white border border-zinc-200 rounded-2xl max-w-md space-y-4 shadow-md">
            <ChefHat className="h-10 w-10 text-zinc-300 mx-auto animate-bounce" />
            <h2 className="font-display text-lg font-bold text-brand-dark">Sign in to start onboarding</h2>
            <p className="text-xs text-brand-gray">Create or log in to a kitchen account to configure your operating profile and get verified.</p>
            <Link
              href="/explore?auth=signin&role=kitchen&redirect=/kitchen/onboarding"
              className="inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm"
            >
              Log In as Kitchen
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Already pending verification screen
  const isPendingVerification = user?.kitchenProfile?.status === 'PENDING_VERIFICATION' || step === 7;

  if (isPendingVerification) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-[#FBFBF9] py-16 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-amber-100 text-brand-accent flex items-center justify-center mx-auto shadow-sm">
              <Clock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-extrabold text-brand-dark">Verification Pending</h1>
              <p className="text-xs text-brand-gray">Your onboarding and mock subscription payment are complete. Platform admins are reviewing your uploaded documents.</p>
            </div>
            
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-left text-xs text-brand-gray space-y-2 font-medium">
              <p><strong>Kitchen:</strong> <span className="text-brand-dark">{user?.kitchenProfile?.name || kitchenName}</span></p>
              <p><strong>Plan Selected:</strong> <span className="text-brand-dark">{selectedPlan.name} (₹{selectedPlan.price}/mo)</span></p>
              <p><strong>Status:</strong> <span className="text-brand-accent-dark font-bold">Pending Review</span></p>
            </div>

            <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-[10px] text-center font-medium">
              💡 Hackathon Tip: Log in to the <strong>Admin Dashboard</strong> (admin@digitaldabba.com) to approve this kitchen application and go LIVE!
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white text-center font-semibold text-xs py-3 rounded-lg shadow-sm transition-colors"
              >
                Refresh Approval Status
              </button>
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
        <div className="mx-auto max-w-2xl px-4">
          
          {/* Progress Indicators */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between text-xs text-brand-gray font-semibold">
              <span>Step {step} of 6</span>
              <span>{Math.round(((step - 1) / 5) * 100)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-primary rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 5) * 100}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex gap-3 text-xs font-semibold">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold text-brand-dark">Validation Error</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Business Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <Building className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">1. Business Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Registered Business Name *</label>
                    <input type="text" required placeholder="Raj Catering Services" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">PAN Number *</label>
                      <input type="text" required placeholder="ABCDE1234F" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white font-mono" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">GSTIN Number (Optional)</label>
                      <input type="text" placeholder="29AAAAA1111A1Z1" value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white font-mono" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Kitchen Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">2. Kitchen Profile Details</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Public Kitchen Name *</label>
                    <input type="text" required placeholder="HomeBowl Kitchen" value={kitchenName} onChange={(e) => setKitchenName(e.target.value)} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Cuisine Specialties *</label>
                      <input type="text" required placeholder="North Indian • Healthy Meals" value={cuisine} onChange={(e) => setCuisine(e.target.value)} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Order Cutoff Time *</label>
                      <select value={cutoffTime} onChange={(e) => setCutoffTime(e.target.value)} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white">
                        <option value="18:00">06:00 PM</option>
                        <option value="20:00">08:00 PM</option>
                        <option value="21:00">09:00 PM (Recommended)</option>
                        <option value="22:00">10:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Kitchen Description / Bio</label>
                    <textarea placeholder="Ghar jaisa khana — prepared with love from fresh, local ingredients..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white h-20 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Documents Upload */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">3. Required Documents</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-brand-gray">Upload FSSAI Certificate, Kitchen Licenses, or ID proof to satisfy verification regulations.</p>
                  
                  <div className="p-6 border-2 border-dashed border-zinc-200 rounded-xl text-center space-y-3 bg-[#FBFBF9]">
                    <FileText className="h-8 w-8 text-zinc-400 mx-auto" />
                    <div className="text-xs">
                      <button type="button" onClick={() => setDocumentsUploaded(true)} className="text-brand-primary font-bold hover:underline">
                        Click here to upload simulated FSSAI document
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400">PDF, PNG, JPG accepted (Max 5MB)</p>
                  </div>

                  {documentsUploaded && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-brand-primary text-xs rounded-xl flex items-center gap-2 font-bold">
                      <CheckCircle2 className="h-4 w-4" />
                      FSSAI_License_Mock.pdf uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Delivery Area */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">4. Hyperlocal Delivery Area</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-brand-gray">Select neighborhoods in Bengaluru where you will fulfill clustered delivery routes.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {availableAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleToggleArea(area)}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          deliveryArea.includes(area)
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                            : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                        }`}
                      >
                        {area}
                        {deliveryArea.includes(area) && <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Subscriptions Plans */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">5. Choose Subscription Plan</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-brand-gray">Predictable flat subscription instead of high percentage commissions.</p>
                  <div className="space-y-3">
                    {plans.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setSelectedPlan({ name: p.name, price: p.price })}
                        className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all ${
                          selectedPlan.name === p.name
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                            : 'bg-white border-zinc-200 text-brand-gray hover:border-zinc-300'
                        }`}
                      >
                        <div className="space-y-1 max-w-sm">
                          <p className="text-xs font-extrabold text-brand-dark">{p.name}</p>
                          <p className="text-[10px] text-brand-gray leading-normal">{p.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-base font-extrabold text-brand-dark">₹{p.price.toLocaleString()}</span>
                          <span className="text-[8px] text-brand-gray font-medium">/mo</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Payment Info */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-primary" />
                  <h2 className="font-display text-base font-extrabold text-brand-dark">6. Subscription Payment</h2>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs text-brand-gray font-semibold">
                    <span>Active Plan: {selectedPlan.name}</span>
                    <span className="text-brand-dark">₹{selectedPlan.price}/month</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Test Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-brand-primary focus:bg-white font-mono"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-400 font-medium">Mock billing cycle. No actual transaction fees will apply.</p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-4 border-t border-zinc-100 flex justify-between gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gray hover:text-brand-dark border border-zinc-200 px-4 py-2.5 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              
              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto inline-flex items-center gap-1 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  Next Step <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitOnboarding}
                  disabled={loading || !cardNumber}
                  className="ml-auto inline-flex items-center gap-1 bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm & Submit'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
