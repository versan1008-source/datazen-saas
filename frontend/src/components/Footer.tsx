'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Mail, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'API Docs', href: '/docs' },
      { label: 'Status', href: 'https://status.versan.in' },
    ],
    Company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
    Legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
    Resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Tutorials', href: '/tutorials' },
      { label: 'Community', href: '/community' },
      { label: 'Support', href: '/support' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/versan', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/versan', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com/versan', label: 'Twitter' },
    { icon: Mail, href: 'mailto:hello@versan.in', label: 'Email' },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DataZen</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Intelligent web scraping for the modern era
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8">
          {/* Newsletter */}
          <div className="mb-8 max-w-md">
            <h3 className="text-white font-semibold mb-4">Subscribe to our newsletter</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
                Subscribe
              </button>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {currentYear} DataZen. All rights reserved.</p>
            <p>
              Made with ❤️ by{' '}
              <a href="https://versan.in" className="text-blue-400 hover:text-blue-300">
                Versan
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

