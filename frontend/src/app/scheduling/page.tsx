'use client';

import React, { useState } from 'react';
import { Clock, Plus, AlertCircle, Trash2, Edit2, Check } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

function SchedulingContent() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    dataType: 'text',
    frequency: 'daily',
    time: '09:00'
  });

  // Check if user's plan supports scheduling
  const canSchedule = user && (user.plan === 'pro' || user.plan === 'business');
  const maxJobs = user?.plan === 'business' ? 'Unlimited' : (user?.plan === 'pro' ? '10' : '0');

  const handleAddJob = () => {
    if (!formData.url.trim()) {
      alert('Please enter a URL');
      return;
    }

    const newJob = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
      nextRun: new Date().toISOString(),
      status: 'active'
    };

    setJobs([...jobs, newJob]);
    setFormData({ url: '', dataType: 'text', frequency: 'daily', time: '09:00' });
    setShowForm(false);
  };

  const handleDeleteJob = (id: number) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== id));
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Scheduled Jobs</h1>
            <p className="text-slate-400">Automate your web scraping with scheduled jobs</p>
          </div>

          {!canSchedule && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-yellow-300 font-bold mb-2">Scheduling is only available in Pro and Business plans</h3>
                <p className="text-yellow-200 text-sm mb-4">Upgrade your plan to schedule automatic scraping jobs and run them on a recurring basis.</p>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all"
                >
                  View Plans →
                </Link>
              </div>
            </div>
          )}

          {canSchedule && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Active Jobs</p>
                  <p className="text-3xl font-bold text-cyan-400">{jobs.filter(j => j.status === 'active').length}</p>
                </div>
                <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Max Jobs</p>
                  <p className="text-3xl font-bold text-cyan-400">{maxJobs}</p>
                </div>
                <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Total Runs</p>
                  <p className="text-3xl font-bold text-cyan-400">{jobs.length * 30}</p>
                </div>
              </div>

              {/* Add Job Button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg transition-all mb-8"
              >
                <Plus className="w-4 h-4" />
                Create New Job
              </button>

              {/* Add Job Form */}
              {showForm && (
                <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold mb-4">Create Scheduled Job</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Website URL</label>
                      <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Data Type</label>
                        <select
                          value={formData.dataType}
                          onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100"
                        >
                          <option value="text">Text</option>
                          <option value="images">Images</option>
                          <option value="links">Links</option>
                          <option value="emails">Emails</option>
                          <option value="phone_numbers">Phone Numbers</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100"
                        >
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddJob}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Create Job
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

              {/* Jobs List */}
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job.id} className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-100 mb-1">{job.url}</h4>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="capitalize">{job.dataType}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {job.frequency} at {job.time}
                            </span>
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              {job.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-400 hover:text-cyan-400">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 hover:bg-slate-700/50 rounded transition-colors text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No scheduled jobs yet. Create one to get started!</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function SchedulingPage() {
  return (
    <ProtectedRoute>
      <SchedulingContent />
    </ProtectedRoute>
  );
}

