'use client';

import React from 'react';
import { Brain, Zap, Shield, Globe, BarChart3, Code, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
                <span className="text-blue-300 text-sm font-semibold">🚀 Powered by AI</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Extract Data from Any Website
              </h1>

              <p className="text-xl text-gray-300 mb-8">
                DataZen uses advanced AI to automatically extract, parse, and structure data from any website. No coding required.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-semibold transition-all"
                >
                  Learn More
                </Link>
              </div>

              <div className="flex items-center gap-8 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-sm text-gray-300">Scraping...</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="text-xs text-gray-400 mb-2">Extracted Data</div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-600 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-600 rounded w-full"></div>
                      <div className="h-2 bg-slate-600 rounded w-5/6"></div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="text-xs text-gray-400 mb-2">Export Options</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-xs">JSON</span>
                      <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-xs">CSV</span>
                      <span className="px-2 py-1 bg-blue-500/30 text-blue-300 rounded text-xs">Excel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Why Choose DataZen?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered',
                description: 'Advanced AI automatically identifies and extracts relevant data',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Scrape thousands of pages in minutes with optimized infrastructure',
              },
              {
                icon: Shield,
                title: 'Reliable',
                description: '99.9% uptime guarantee with enterprise-grade security',
              },
              {
                icon: Globe,
                title: 'Global Coverage',
                description: 'Access websites from any country with rotating proxies',
              },
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track usage and monitor performance with detailed dashboards',
              },
              {
                icon: Code,
                title: 'Easy Integration',
                description: 'REST API and webhooks for seamless integration',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-slate-900 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all">
                  <Icon className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of users extracting data with DataZen
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
          >
            Start Your Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

