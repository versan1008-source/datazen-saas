'use client';

import React, { useState } from 'react';
import { Webhook, Plus, AlertCircle, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

function WebhooksContent() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSecret, setShowSecret] = useState<{ [key: number]: boolean }>({});
  const [copied, setCopied] = useState<{ [key: number]: boolean }>({});
  const [formData, setFormData] = useState({
    url: '',
    events: ['scrape.completed']
  });

  // Check if user's plan supports webhooks
  const canUseWebhooks = user && (user.plan === 'pro' || user.plan === 'business');

  const handleAddWebhook = () => {
    if (!formData.url.trim()) {
      alert('Please enter a webhook URL');
      return;
    }

    const newWebhook = {
      id: Date.now(),
      url: formData.url,
      events: formData.events,
      secret: 'whk_' + Math.random().toString(36).substr(2, 32),
      createdAt: new Date().toISOString(),
      active: true,
      lastTriggered: null
    };

    setWebhooks([...webhooks, newWebhook]);
    setFormData({ url: '', events: ['scrape.completed'] });
    setShowForm(false);
  };

  const handleDeleteWebhook = (id: number) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      setWebhooks(webhooks.filter(w => w.id !== id));
    }
  };

  const handleCopySecret = (id: number, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopied({ ...copied, [id]: true });
    setTimeout(() => setCopied({ ...copied, [id]: false }), 2000);
  };

  const eventOptions = [
    { value: 'scrape.completed', label: 'Scrape Completed' },
    { value: 'scrape.failed', label: 'Scrape Failed' },
    { value: 'job.scheduled', label: 'Job Scheduled' },
    { value: 'job.executed', label: 'Job Executed' },
    { value: 'quota.exceeded', label: 'Quota Exceeded' }
  ];

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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Webhooks</h1>
            <p className="text-slate-400">Receive real-time notifications for scraping events</p>
          </div>

          {!canUseWebhooks && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-300 font-bold mb-2">Webhooks are only available in Pro and Business plans</h3>
                <p className="text-yellow-200 text-sm mb-4">Upgrade your plan to receive real-time notifications for scraping events and integrate with your applications.</p>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all"
                >
                  View Plans →
                </Link>
              </div>
            </div>
          )}

          {canUseWebhooks && (
            <>
              {/* Add Webhook Button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all mb-8"
              >
                <Plus className="w-4 h-4" />
                Add Webhook
              </button>

              {/* Add Webhook Form */}
              {showForm && (
                <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold mb-4">Create New Webhook</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Webhook URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://your-domain.com/webhook"
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
                      />
                      <p className="text-xs text-slate-400 mt-1">Must be a valid HTTPS URL</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Events</label>
                      <div className="space-y-2">
                        {eventOptions.map(event => (
                          <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.events.includes(event.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({ ...formData, events: [...formData.events, event.value] });
                                } else {
                                  setFormData({ ...formData, events: formData.events.filter(ev => ev !== event.value) });
                                }
                              }}
                              className="rounded border-slate-600 text-cyan-500"
                            />
                            <span className="text-slate-300">{event.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddWebhook}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Create Webhook
                      </button>
                      <button
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Webhooks List */}
              {webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map(webhook => (
                    <div key={webhook.id} className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-100 mb-1">{webhook.url}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              {webhook.active ? 'Active' : 'Inactive'}
                            </span>
                            {webhook.lastTriggered && (
                              <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-2">Events:</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map(event => (
                            <span key={event} className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs">
                              {eventOptions.find(e => e.value === event)?.label || event}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-700/50 pt-3">
                        <p className="text-xs text-slate-400 mb-2">Secret Key:</p>
                        <div className="flex gap-2">
                          <input
                            type={showSecret[webhook.id] ? 'text' : 'password'}
                            value={webhook.secret}
                            readOnly
                            className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded text-slate-100 font-mono text-xs"
                          />
                          <button
                            onClick={() => setShowSecret({ ...showSecret, [webhook.id]: !showSecret[webhook.id] })}
                            className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-400 hover:text-cyan-400"
                          >
                            {showSecret[webhook.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleCopySecret(webhook.id, webhook.secret)}
                            className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-400 hover:text-cyan-400"
                          >
                            {copied[webhook.id] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Webhook className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No webhooks configured yet. Add one to get started!</p>
                </div>
              )}

              {/* Documentation */}
              <div className="mt-12 backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-4">Webhook Documentation</h3>
                <p className="text-slate-400 mb-4">
                  Learn how to set up and handle webhooks for real-time notifications.
                </p>
                <a
                  href="https://docs.datazen.io/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all"
                >
                  View Webhook Docs →
                </a>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function WebhooksPage() {
  return (
    <ProtectedRoute>
      <WebhooksContent />
    </ProtectedRoute>
  );
}

