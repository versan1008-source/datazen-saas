'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

function BillingContent() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'starter' | 'pro' | 'business'>(user?.plan || 'free');

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      requests: '10 pages/month',
      features: [
        'Basic data extraction',
        'JSON export only',
        'Email support',
        '1 concurrent job'
      ],
      id: 'free'
    },
    {
      name: 'Starter',
      price: '$4.99',
      period: '/month',
      requests: '2,000 pages/month',
      features: [
        'Basic data extraction',
        'JSON export',
        'Email support',
        '1 concurrent job'
      ],
      id: 'starter'
    },
    {
      name: 'Pro',
      price: '$14.99',
      period: '/month',
      requests: '25,000 pages/month',
      features: [
        'Advanced data extraction',
        'CSV & JSON export',
        'Priority email support',
        '10 concurrent jobs',
        'Scheduling',
        'Webhooks',
        'API access'
      ],
      id: 'pro'
    },
    {
      name: 'Business',
      price: '$39.99',
      period: '/month',
      requests: '100,000 pages/month',
      features: [
        'Enterprise data extraction',
        'All export formats',
        '24/7 phone & email support',
        'Unlimited concurrent jobs',
        'Scheduling',
        'Webhooks',
        'API access',
        'Dedicated proxy'
      ],
      id: 'business'
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === 'free') {
      alert('You are already on the Free plan');
      return;
    }
    alert(`Upgrading to ${planId} plan... (Payment integration coming soon)`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-slate-950/40 border-b border-slate-800/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    DataZen
                  </h1>
                </div>
              </Link>
              <Link href="/" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Billing Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-100">
                Billing & Plans
              </h2>
              <p className="text-xl text-slate-300">
                Current Plan: <span className="font-bold text-cyan-400 capitalize">{user?.plan}</span>
              </p>
              <p className="text-slate-400 mt-2">
                Requests Used: <span className="font-semibold text-cyan-400">{user?.requestsUsed}/{user?.requestsLimit}</span>
              </p>
            </div>

            {/* Current Plan Card */}
            <div className="mb-12 backdrop-blur-md bg-slate-800/40 border-2 border-cyan-400/50 rounded-2xl p-8 shadow-2xl shadow-cyan-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-2">Your Current Plan</h3>
                  <p className="text-slate-400">Manage your subscription and billing information</p>
                </div>
                <CreditCard className="w-12 h-12 text-cyan-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Plan Name</p>
                  <p className="text-2xl font-bold text-slate-100 capitalize">{user?.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Requests Remaining</p>
                  <p className="text-2xl font-bold text-cyan-400">{(user?.requestsLimit || 0) - (user?.requestsUsed || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Renewal Date</p>
                  <p className="text-2xl font-bold text-slate-100">Next Month</p>
                </div>
              </div>
            </div>

            {/* Plans Comparison */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-100 mb-8">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl backdrop-blur-md transition-all duration-300 ${
                      user?.plan === plan.id
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400/50 shadow-2xl shadow-cyan-500/20'
                        : 'bg-slate-800/40 border border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    {user?.plan === plan.id && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold">
                          Current Plan
                        </div>
                      </div>
                    )}

                    <div className="p-8">
                      <h4 className="text-2xl font-bold text-slate-100 mb-2">{plan.name}</h4>
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-white">{plan.price}</span>
                          <span className="text-slate-400">{plan.period}</span>
                        </div>
                        <p className="text-cyan-400 text-sm mt-2">{plan.requests}</p>
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={user?.plan === plan.id}
                        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 mb-8 ${
                          user?.plan === plan.id
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50'
                        }`}
                      >
                        {user?.plan === plan.id ? 'Current Plan' : 'Upgrade'}
                        {user?.plan !== plan.id && <ArrowRight className="w-4 h-4" />}
                      </button>

                      <div className="space-y-4">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Billing History</h3>
              <div className="text-center py-12">
                <p className="text-slate-400">No billing history yet. Upgrade to a paid plan to see your invoices here.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 backdrop-blur-md bg-slate-950/40 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-lg font-semibold text-slate-100">DataZen</span>
              </div>
              <p className="text-slate-400 text-sm text-center md:text-right">
                © 2024 DataZen. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  );
}

