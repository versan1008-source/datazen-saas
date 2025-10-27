'use client';

import React, { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Lock, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { apiService } from '@/lib/api';

function SettingsContent() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Check if user's plan supports API access
  const canAccessAPI = user && (user.plan === 'pro' || user.plan === 'business');

  useEffect(() => {
    if (user?.api_key) {
      setApiKey(user.api_key);
    }
  }, [user]);

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateApiKey = async () => {
    if (!canAccessAPI) {
      setError('API access is only available in Pro and Business plans');
      return;
    }

    if (!window.confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiService.regenerateApiKey();
      setApiKey(response.api_key);
      setMessage('API key regenerated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to regenerate API key');
    } finally {
      setLoading(false);
    }
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
                  <span className="text-white font-bold text-lg">DZ</span>
                </div>
                <span className="font-bold text-xl">DataZen</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/billing" className="text-slate-300 hover:text-white transition-colors">
                  Billing
                </Link>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account and API keys</p>
          </div>

          {/* API Keys Section */}
          <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="flex items-center mb-6">
              <Lock className="w-6 h-6 text-cyan-400 mr-3" />
              <h2 className="text-2xl font-bold">API Keys</h2>
            </div>

            {!canAccessAPI && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-300 font-medium">API access is only available in Pro and Business plans</p>
                  <p className="text-yellow-200 text-sm mt-1">Upgrade your plan to get access to API keys and programmatic access.</p>
                  <Link
                    href="/billing"
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium mt-2 inline-block"
                  >
                    View Plans →
                  </Link>
                </div>
              </div>
            )}

            {canAccessAPI && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Your API Key</label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          readOnly
                          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 font-mono text-sm"
                        />
                      </div>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title={showApiKey ? 'Hide' : 'Show'}
                      >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleRegenerateApiKey}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      {loading ? 'Regenerating...' : 'Regenerate API Key'}
                    </button>
                    <p className="text-xs text-slate-400 mt-2">
                      Regenerating your API key will invalidate the current key. Update any applications using this key.
                    </p>
                  </div>
                </div>

                {message && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* API Documentation Link */}
          {canAccessAPI && (
            <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">API Documentation</h3>
              <p className="text-slate-400 mb-4">
                Learn how to use the DataZen API to programmatically scrape websites and manage your account.
              </p>
              <a
                href="https://docs.datazen.io/api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all"
              >
                View API Docs →
              </a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

