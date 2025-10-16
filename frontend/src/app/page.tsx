'use client';

import React, { useState } from 'react';
import { Brain, Globe, Zap, Shield, Download, Github } from 'lucide-react';
import ScrapeForm from '@/components/ScrapeForm';
import ResultTable from '@/components/ResultTable';
import Loader, { ProgressSteps } from '@/components/Loader';
import { apiService, ScrapeRequest, EnhancedScrapeRequest, ScrapeResponse } from '@/lib/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [enhancedMode, setEnhancedMode] = useState(false);

  const scrapeSteps = enhancedMode ? [
    'Validating URL',
    'Detecting Website Type',
    'Fetching Page Content',
    'Extracting Enhanced Data',
    'Processing Results'
  ] : [
    'Validating URL',
    'Fetching Page',
    'Extracting Data',
    'Processing Results'
  ];

  const handleScrapeSubmit = async (request: ScrapeRequest | EnhancedScrapeRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setCurrentStep(0);

    try {
      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);

      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          const nextStep = prev + 1;
          return nextStep >= scrapeSteps.length ? scrapeSteps.length - 1 : nextStep;
        });
      }, 2000);

      // Make the actual API call
      const response = enhancedMode
        ? await apiService.scrapeWebsiteEnhanced(request as EnhancedScrapeRequest)
        : await apiService.scrapeWebsite(request as ScrapeRequest);

      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(stepInterval);

      // Complete progress
      setProgress(100);
      setCurrentStep(scrapeSteps.length - 1);

      // Set result after a brief delay to show completion
      setTimeout(() => {
        setResult(response);
        setIsLoading(false);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  const handleNewScrape = () => {
    setResult(null);
    setError(null);
    setProgress(0);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  DataZen
                </h1>
              </div>
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                v1.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Real-Time AI Web Scraper
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Extract text, images, links, or emails from any public website instantly.
            Powered by AI for intelligent data structuring and analysis.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Lightning Fast</h3>
              <p className="text-sm text-gray-600">Results in seconds</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">AI Powered</h3>
              <p className="text-sm text-gray-600">Smart data structuring</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Export Ready</h3>
              <p className="text-sm text-gray-600">CSV & JSON downloads</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Respectful</h3>
              <p className="text-sm text-gray-600">Honors robots.txt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <ScrapeForm
              onSubmit={handleScrapeSubmit}
              isLoading={isLoading}
              enhancedMode={enhancedMode}
              onEnhancedModeChange={setEnhancedMode}
            />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="space-y-6">
                <Loader
                  message={`${scrapeSteps[currentStep]}...`}
                  progress={progress}
                  aiMode={false} // Will be determined by the request
                />
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <ProgressSteps
                    steps={scrapeSteps}
                    currentStep={currentStep}
                    aiMode={false} // Will be determined by the request
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 text-lg">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-red-900">Scraping Failed</h3>
                </div>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={handleNewScrape}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {result && (
              <ResultTable result={result} onNewScrape={handleNewScrape} />
            )}

            {!isLoading && !error && !result && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
                <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Scrape
                </h3>
                <p className="text-gray-600">
                  Enter a website URL and select the data type you want to extract.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-lg font-semibold">DataZen</span>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-right">
              DataZen scrapes only publicly available data and respects robots.txt.<br />
              Use responsibly and in accordance with website terms of service.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
