/**
 * Scrape form component for DataZen
 */

import React, { useState, useEffect } from 'react';
import { Search, Brain, Globe, AlertCircle, Info, Zap, Phone, Zap as ZapIcon } from 'lucide-react';
import Link from 'next/link';
import { apiService, ScrapeRequest, EnhancedScrapeRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface ScrapeFormProps {
  onSubmit: (request: ScrapeRequest | EnhancedScrapeRequest) => void;
  isLoading: boolean;
  enhancedMode?: boolean;
  onEnhancedModeChange?: (enabled: boolean) => void;
}

const ScrapeForm: React.FC<ScrapeFormProps> = ({ onSubmit, isLoading, enhancedMode = false, onEnhancedModeChange }) => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [dataType, setDataType] = useState<'text' | 'images' | 'links' | 'emails' | 'phone_numbers' | 'linkedin_profile' | 'linkedin_company' | 'linkedin_jobs' | 'social_posts' | 'ecommerce_products'>('text');
  const [aiMode, setAiMode] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [checkRobots, setCheckRobots] = useState(true);
  const [resolveOwner, setResolveOwner] = useState(false);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [urlError, setUrlError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user has reached their limit
  const hasReachedLimit = user && user.requestsUsed >= user.requestsLimit;
  const requestsRemaining = user ? user.requestsLimit - user.requestsUsed : 0;

  // Check AI availability on component mount
  useEffect(() => {
    const checkAI = async () => {
      try {
        const result = await apiService.testAI();
        setAiAvailable(result.available && result.success);
      } catch (error) {
        setAiAvailable(false);
      }
    };
    checkAI();
  }, []);

  // Validate URL
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);

    if (newUrl && !validateUrl(newUrl)) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has reached their limit
    if (hasReachedLimit) {
      setShowUpgradeModal(true);
      return;
    }

    if (!url.trim()) {
      setUrlError('URL is required');
      return;
    }

    if (!validateUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }

    // Map enhanced data types to basic types for API
    const basicDataType = (['text', 'images', 'links', 'emails', 'phone_numbers'].includes(dataType)
      ? dataType
      : 'text') as 'text' | 'images' | 'links' | 'emails' | 'phone_numbers';

    const request: ScrapeRequest = {
      url: url.trim(),
      data_type: basicDataType,
      ai_mode: aiMode && aiAvailable === true,
      custom_prompt: customPrompt.trim() || undefined,
      check_robots: checkRobots,
      resolve_owner: resolveOwner && dataType === 'phone_numbers'
    };

    onSubmit(request);
  };

  const basicDataTypeOptions = [
    { value: 'text', label: 'Text Content', icon: '📝', description: 'Extract visible text, headings, and paragraphs' },
    { value: 'images', label: 'Images', icon: '🖼️', description: 'Extract image URLs and metadata' },
    { value: 'links', label: 'Links', icon: '🔗', description: 'Extract all links and their information' },
    { value: 'emails', label: 'Email Addresses', icon: '📧', description: 'Find email addresses and contact info' },
    { value: 'phone_numbers', label: 'Phone Numbers', icon: '☎️', description: 'Extract phone numbers from the website' }
  ];

  const enhancedDataTypeOptions = [
    { value: 'text', label: 'General Text', icon: '📝', description: 'Extract all text content with smart categorization' },
    { value: 'linkedin_profile', label: 'LinkedIn Profile', icon: '👤', description: 'Extract profile info, experience, and skills' },
    { value: 'linkedin_company', label: 'LinkedIn Company', icon: '🏢', description: 'Extract company details and information' },
    { value: 'linkedin_jobs', label: 'LinkedIn Jobs', icon: '💼', description: 'Extract job postings and requirements' },
    { value: 'social_posts', label: 'Social Media Posts', icon: '📱', description: 'Extract posts from social platforms' },
    { value: 'ecommerce_products', label: 'E-commerce Products', icon: '🛒', description: 'Extract product info, prices, and reviews' },
    { value: 'images', label: 'Images', icon: '🖼️', description: 'Extract image URLs and metadata' },
    { value: 'links', label: 'Links', icon: '🔗', description: 'Extract all links and their information' },
    { value: 'emails', label: 'Email Addresses', icon: '📧', description: 'Find email addresses and contact info' },
    { value: 'phone_numbers', label: 'Phone Numbers', icon: '☎️', description: 'Extract phone numbers from the website' }
  ];

  const dataTypeOptions = enhancedMode ? enhancedDataTypeOptions : basicDataTypeOptions;

  return (
    <div>
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 mx-auto mb-4">
              <ZapIcon className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-100 text-center mb-2">Request Limit Reached</h3>
            <p className="text-slate-400 text-center mb-6">
              You've used all {user?.requestsLimit} requests for this month. Upgrade your plan to continue scraping.
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-300 mb-2">Current Plan: <span className="font-bold text-cyan-400 capitalize">{user?.plan}</span></p>
              <p className="text-sm text-slate-400">Requests: {user?.requestsUsed}/{user?.requestsLimit}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <Link
                href="/billing"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all text-center"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Usage Display */}
      {user && (
        <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Requests Used</span>
            <span className="text-sm font-bold text-cyan-400">{user.requestsUsed}/{user.requestsLimit}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                hasReachedLimit ? 'bg-red-500' : requestsRemaining < 10 ? 'bg-yellow-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min((user.requestsUsed / user.requestsLimit) * 100, 100)}%` }}
            />
          </div>
          {hasReachedLimit && (
            <p className="text-xs text-red-400 mt-2">Limit reached. Upgrade to continue.</p>
          )}
          {requestsRemaining < 10 && !hasReachedLimit && (
            <p className="text-xs text-yellow-400 mt-2">{requestsRemaining} requests remaining</p>
          )}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center">
          <Globe className="w-6 h-6 mr-2 text-cyan-400" />
          Extract Data
        </h2>
        <p className="text-slate-400">
          Choose your data type and let DataZen extract instantly.
        </p>
      </div>

      {/* Enhanced Mode Toggle */}
      {onEnhancedModeChange && (
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 text-cyan-400 mr-2" />
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Enhanced Mode</h3>
                <p className="text-xs text-slate-400">LinkedIn, social media, e-commerce</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enhancedMode}
                onChange={(e) => onEnhancedModeChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
            </label>
          </div>
          {enhancedMode && (
            <div className="mt-3 text-xs text-cyan-300 bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <strong>Enhanced:</strong> LinkedIn, social media, e-commerce, structured data
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://example.com"
              className={`
                w-full px-4 py-3 pl-10 border rounded-xl backdrop-blur-sm transition-all
                bg-slate-800/50 text-slate-100 placeholder-slate-500
                focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                ${urlError ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700/50 hover:border-slate-600/50'}
              `}
              disabled={isLoading}
            />
            <Globe className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
          </div>
          {urlError && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {urlError}
            </p>
          )}
        </div>

        {/* Data Type Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Data Type to Extract
          </label>
          <div className="grid grid-cols-1 gap-2">
            {dataTypeOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  relative flex items-start p-4 border rounded-xl cursor-pointer transition-all backdrop-blur-sm
                  ${dataType === option.value
                    ? 'border-cyan-500/50 bg-cyan-500/10 ring-2 ring-cyan-500/30'
                    : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/30'
                  }
                `}
              >
                <input
                  type="radio"
                  name="dataType"
                  value={option.value}
                  checked={dataType === option.value}
                  onChange={(e) => setDataType(e.target.value as any)}
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="font-medium text-slate-100">{option.label}</span>
                  </div>
                  <p className="text-sm text-slate-400">{option.description}</p>
                </div>
                {dataType === option.value && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Resolve Owner Toggle - Only show for Phone Numbers */}
        {dataType === 'phone_numbers' && (
          <div className="border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-cyan-400 mr-2" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Resolve Owner</h3>
                  <p className="text-xs text-slate-400">Attempt to identify who the number belongs to (person or business)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={resolveOwner}
                  onChange={(e) => setResolveOwner(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-600"></div>
              </label>
            </div>
          </div>
        )}

        {/* AI Mode Toggle */}
        <div className="border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm bg-slate-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-purple-400 mr-2" />
              <span className="font-medium text-slate-100">Smart Analysis</span>
              {aiAvailable === false && (
                <span className="ml-2 px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded-lg">
                  Not Available
                </span>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={aiMode}
                onChange={(e) => setAiMode(e.target.checked)}
                disabled={isLoading || aiAvailable !== true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
            </label>
          </div>
          <p className="text-sm text-slate-400 mb-3">
            Intelligently structure and categorize extracted data
          </p>

          {/* Custom Prompt */}
          {aiMode && aiAvailable && (
            <div>
              <label htmlFor="customPrompt" className="block text-sm font-medium text-slate-300 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                id="customPrompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Focus on product information and pricing..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-700/50 rounded-lg bg-slate-800/50 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all"
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div className="border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm bg-slate-800/30">
          <h3 className="font-medium text-slate-100 mb-3 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Advanced Options
          </h3>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkRobots}
              onChange={(e) => setCheckRobots(e.target.checked)}
              disabled={isLoading}
              className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
            />
            <span className="ml-2 text-sm text-slate-300">
              Respect robots.txt (recommended)
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !url.trim() || !!urlError}
          className={`
            w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-medium transition-all
            ${isLoading || !url.trim() || !!urlError
              ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/50 transform hover:-translate-y-0.5'
            }
          `}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Extracting...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Extract Data
              <Zap className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ScrapeForm;
