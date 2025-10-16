'use client';

import React, { useState } from 'react';
import { Check, X, Zap, Crown, Rocket } from 'lucide-react';
import Link from 'next/link';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 4.99 : 49.90,
      description: 'Perfect for individuals and small projects',
      icon: Zap,
      features: [
        { name: '2,000 pages/month', included: true },
        { name: '1 concurrent job', included: true },
        { name: 'Basic data extraction', included: true },
        { name: 'JSON export', included: true },
        { name: 'Email support', included: true },
        { name: 'Scheduling', included: false },
        { name: 'Webhooks', included: false },
        { name: 'API access', included: false },
        { name: 'Dedicated proxy', included: false },
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 14.99 : 149.90,
      description: 'For growing businesses and teams',
      icon: Crown,
      features: [
        { name: '25,000 pages/month', included: true },
        { name: '10 concurrent jobs', included: true },
        { name: 'Advanced data extraction', included: true },
        { name: 'CSV & JSON export', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Scheduling', included: true },
        { name: 'Webhooks', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated proxy', included: false },
      ],
      cta: 'Start Free Trial',
      highlighted: true,
    },
    {
      name: 'Business',
      price: billingCycle === 'monthly' ? 39.99 : 399.90,
      description: 'For enterprises and power users',
      icon: Rocket,
      features: [
        { name: '100,000 pages/month', included: true },
        { name: 'Unlimited concurrent jobs', included: true },
        { name: 'Enterprise data extraction', included: true },
        { name: 'All export formats', included: true },
        { name: '24/7 phone & email support', included: true },
        { name: 'Scheduling', included: true },
        { name: 'Webhooks', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated proxy', included: true },
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Choose the perfect plan for your web scraping needs
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? 'ring-2 ring-blue-500 transform scale-105 shadow-2xl'
                    : 'border border-slate-700'
                } ${plan.highlighted ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-slate-800'}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>

                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/auth/signup"
                    className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 block text-center ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? 'text-gray-200' : 'text-gray-500'
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: 'Can I change my plan anytime?',
              a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'What happens if I exceed my quota?',
              a: 'We\'ll notify you when you\'re approaching your limit. You can upgrade anytime to get more pages.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes, all plans come with a 14-day free trial. No credit card required.',
            },
          ].map((faq, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

