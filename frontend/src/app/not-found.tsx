/**
 * 404 Not Found page for DataZen
 */

import React from 'react';
import Link from 'next/link';
import { Brain, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-blue-600" />
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist. Let's get you back to scraping some data!
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to DataZen
          </Link>
          
          <div className="flex items-center justify-center text-gray-500">
            <Brain className="w-4 h-4 mr-2" />
            <span className="text-sm">Powered by DataZen</span>
          </div>
        </div>
      </div>
    </div>
  );
}
