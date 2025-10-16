/**
 * Loading page for DataZen
 */

import React from 'react';
import { Brain } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          DataZen
        </h1>
        <p className="text-gray-600">Loading your AI-powered web scraper...</p>
      </div>
    </div>
  );
}
