'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-300 mb-4">
              By accessing and using DataZen, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on DataZen for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on DataZen</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p className="text-gray-300 mb-4">
              The materials on DataZen are provided on an 'as is' basis. DataZen makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
            <p className="text-gray-300 mb-4">
              In no event shall DataZen or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on DataZen.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
            <p className="text-gray-300 mb-4">
              The materials appearing on DataZen could include technical, typographical, or photographic errors. DataZen does not warrant that any of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">6. Links</h2>
            <p className="text-gray-300 mb-4">
              DataZen has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by DataZen of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
            <p className="text-gray-300 mb-4">
              DataZen may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
            <p className="text-gray-300 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which DataZen operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
            <p className="text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at support@datazen.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

