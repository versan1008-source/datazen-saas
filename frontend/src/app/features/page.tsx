'use client';

import React from 'react';
import {
  Brain,
  Zap,
  Shield,
  Globe,
  Database,
  Code,
  BarChart3,
  Lock,
  Smartphone,
  Clock,
  Users,
  Webhook,
} from 'lucide-react';
import Link from 'next/link';

const FeaturesPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Extraction',
      description: 'Advanced AI algorithms automatically identify and extract relevant data from any website.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Scrape thousands of pages in minutes with our optimized infrastructure.',
    },
    {
      icon: Shield,
      title: 'Anti-Bot Protection',
      description: 'Bypass anti-scraping measures with rotating proxies and intelligent headers.',
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Access websites from any country with our worldwide proxy network.',
    },
    {
      icon: Database,
      title: 'Multiple Formats',
      description: 'Export data in JSON, CSV, Excel, or directly to your database.',
    },
    {
      icon: Code,
      title: 'REST API',
      description: 'Integrate scraping into your applications with our powerful REST API.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track usage, monitor performance, and analyze scraping patterns.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance with GDPR, CCPA, and SOC 2.',
    },
    {
      icon: Smartphone,
      title: 'Mobile App',
      description: 'Manage your scraping jobs on the go with our mobile application.',
    },
    {
      icon: Clock,
      title: 'Scheduled Scraping',
      description: 'Set up automatic scraping jobs to run on a schedule.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members and manage permissions with role-based access.',
    },
    {
      icon: Webhook,
      title: 'Webhooks',
      description: 'Get real-time notifications when scraping jobs complete.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Powerful Features for Every Use Case
          </h1>
          <p className="text-xl text-gray-300">
            Everything you need to scrape the web efficiently and reliably
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <Icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">
          Perfect For Your Industry
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'E-Commerce',
              description: 'Monitor competitor prices, track inventory, and analyze product listings.',
              icon: '🛍️',
            },
            {
              title: 'Real Estate',
              description: 'Collect property listings, prices, and market data automatically.',
              icon: '🏠',
            },
            {
              title: 'Job Boards',
              description: 'Aggregate job postings from multiple sources in one place.',
              icon: '💼',
            },
            {
              title: 'News & Media',
              description: 'Monitor news sources and track trending topics in real-time.',
              icon: '📰',
            },
            {
              title: 'Research',
              description: 'Collect academic data, research papers, and citations.',
              icon: '🔬',
            },
            {
              title: 'Lead Generation',
              description: 'Build targeted lead lists from business directories.',
              icon: '📊',
            },
          ].map((useCase, index) => (
            <div
              key={index}
              className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-blue-500 transition-all"
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-2xl font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-gray-400">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of users who are already scraping the web with DataZen
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;

