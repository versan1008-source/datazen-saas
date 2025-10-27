'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Globe, Zap, Shield, Download, Github, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import ScrapeForm from '@/components/ScrapeForm';
import ResultTable from '@/components/ResultTable';
import PhoneNumbersTable from '@/components/PhoneNumbersTable';
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
      const errorMessage = err?.message || err?.error || (typeof err === 'string' ? err : JSON.stringify(err)) || 'An unexpected error occurred';
      setError(errorMessage);
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(148, 163, 184, .05) 25%, rgba(148, 163, 184, .05) 26%, transparent 27%, transparent 74%, rgba(148, 163, 184, .05) 75%, rgba(148, 163, 184, .05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px'
          }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-md bg-slate-950/40 border-b border-slate-800/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    DataZen
                  </h1>
                  <p className="text-xs text-slate-400">v1.0</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-cyan-400"
                >
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Compact */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4 inline-block">
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 backdrop-blur-sm">
                <p className="text-sm font-medium text-cyan-300">✨ Real-Time Web Data Extraction</p>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Extract Data
              </span>
              <span className="text-slate-100"> Instantly</span>
            </h2>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get text, images, links, emails, or phone numbers from any website in seconds.
            </p>
          </div>
        </section>

        {/* Main Content - Centered Form First */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Form Section - Centered */}
          <div className="mb-12" data-scrape-form>
            <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-slate-100 mb-6">Start Scraping</h3>
              <ScrapeForm
                onSubmit={handleScrapeSubmit}
                isLoading={isLoading}
                enhancedMode={enhancedMode}
                onEnhancedModeChange={setEnhancedMode}
              />
            </div>
          </div>

          {/* Feature Cards - Below Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Results in seconds', color: 'from-yellow-500 to-orange-500' },
              { icon: Globe, title: 'Any Website', desc: 'Works everywhere', color: 'from-cyan-500 to-blue-500' },
              { icon: Download, title: 'Export Ready', desc: 'CSV & JSON', color: 'from-green-500 to-emerald-500' },
              { icon: Shield, title: 'Respectful', desc: 'Honors robots.txt', color: 'from-purple-500 to-pink-500' }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-6 rounded-2xl backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 hover:bg-slate-800/50 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Results Section */}
          {isLoading && (
            <div className="space-y-6">
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                <Loader
                  message={`${scrapeSteps[currentStep]}...`}
                  progress={progress}
                  aiMode={false}
                />
              </div>
              <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <ProgressSteps
                  steps={scrapeSteps}
                  currentStep={currentStep}
                  aiMode={false}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="backdrop-blur-md bg-slate-800/40 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-400 text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-red-300">Scraping Failed</h3>
              </div>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={handleNewScrape}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg font-medium transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {result && result.data_type === 'phone_numbers' ? (
            <PhoneNumbersTable data={result.data} onNewScrape={handleNewScrape} />
          ) : result ? (
            <ResultTable result={result} onNewScrape={handleNewScrape} />
          ) : null}

          {!isLoading && !error && !result && (
            <div className="backdrop-blur-md bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-2">
                Ready to Extract
              </h3>
              <p className="text-slate-400">
                Enter a website URL and select the data type you want to extract.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/50 backdrop-blur-md bg-slate-950/40 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-lg font-semibold text-slate-100">DataZen</span>
              </div>
              <p className="text-slate-400 text-sm text-center md:text-right">
                Extracts only publicly available data and respects robots.txt.<br />
                Use responsibly and in accordance with website terms of service.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
