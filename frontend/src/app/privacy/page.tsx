'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 mb-4">
              DataZen ("we" or "us" or "our") operates the DataZen website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Information Collection and Use</h2>
            <p className="text-gray-300 mb-4">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 className="text-xl font-semibold text-white mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li><strong>Personal Data:</strong> Email address, name, phone number, address, cookies and usage data</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, time and date of visit</li>
              <li><strong>Cookies:</strong> We use cookies to track activity on our Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Use of Data</h2>
            <p className="text-gray-300 mb-4">
              DataZen uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Security of Data</h2>
            <p className="text-gray-300 mb-4">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Changes to This Privacy Policy</h2>
            <p className="text-gray-300 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-300">
              Email: privacy@datazen.com<br />
              Website: www.datazen.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Your Rights</h2>
            <p className="text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

