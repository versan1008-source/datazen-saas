'use client';

import React from 'react';
import { Award, Users, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

const AboutPage = () => {
  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Pages Scraped', value: '1B+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: Zap },
    { label: 'Countries', value: '150+', icon: Award },
  ];

  const team = [
    {
      name: 'Pranabendu Patra',
      role: 'Founder & CEO',
      bio: 'Full-stack developer with 10+ years of experience in web scraping and data extraction.',
      image: '👨‍💼',
    },
    {
      name: 'Tech Team',
      role: 'Engineering',
      bio: 'Expert developers specializing in distributed systems and web automation.',
      image: '👨‍💻',
    },
    {
      name: 'Support Team',
      role: 'Customer Success',
      bio: 'Dedicated support specialists available 24/7 to help you succeed.',
      image: '👨‍🔧',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About DataZen
          </h1>
          <p className="text-xl text-gray-300">
            Empowering businesses with intelligent web scraping solutions
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-300 text-lg mb-4">
              At DataZen, we believe that data is the foundation of informed decision-making. Our mission is to make web scraping accessible, affordable, and reliable for businesses of all sizes.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              We've built a platform that combines cutting-edge AI technology with enterprise-grade reliability to help you extract, analyze, and act on web data faster than ever before.
            </p>
            <p className="text-gray-300 text-lg">
              Whether you're a startup monitoring competitors or an enterprise collecting market intelligence, DataZen is your trusted partner.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-white">Innovating Web Data</h3>
            <p className="text-blue-100 mt-4">
              Powered by AI and built for scale
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
                <Icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Reliability',
              description: 'We guarantee 99.9% uptime and consistent performance you can depend on.',
            },
            {
              title: 'Innovation',
              description: 'We continuously improve our platform with the latest AI and web technologies.',
            },
            {
              title: 'Customer First',
              description: 'Your success is our success. We\'re committed to your growth.',
            },
            {
              title: 'Transparency',
              description: 'Clear pricing, honest communication, and no hidden fees.',
            },
            {
              title: 'Security',
              description: 'Enterprise-grade security to protect your data and privacy.',
            },
            {
              title: 'Sustainability',
              description: 'Ethical scraping practices that respect website policies.',
            },
          ].map((value, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-2">{value.title}</h3>
              <p className="text-gray-400">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
              <div className="text-6xl mb-4">{member.image}</div>
              <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
              <p className="text-blue-400 font-medium mb-4">{member.role}</p>
              <p className="text-gray-400">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Become part of the fastest-growing web scraping platform
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

