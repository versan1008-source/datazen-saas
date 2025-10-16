/**
 * Loading component for DataZen
 */

import React from 'react';
import { Loader2, Brain, Globe, Search } from 'lucide-react';

interface LoaderProps {
  message?: string;
  progress?: number;
  aiMode?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  message = "Scraping website...", 
  progress,
  aiMode = false 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200">
      {/* Main spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {aiMode ? (
            <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
          ) : (
            <Search className="w-6 h-6 text-blue-600 animate-pulse" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full max-w-xs mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Message */}
      <p className="text-gray-700 text-center font-medium mb-4">
        {message}
      </p>

      {/* Animated icons */}
      <div className="flex space-x-4 opacity-60">
        <Globe className="w-5 h-5 text-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        {aiMode && (
          <Brain className="w-5 h-5 text-purple-500 animate-pulse" style={{ animationDelay: '200ms' }} />
        )}
      </div>

      {/* AI mode indicator */}
      {aiMode && (
        <div className="mt-4 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          🧠 AI Processing Enabled
        </div>
      )}
    </div>
  );
};

// Simple spinner for inline use
export const SimpleSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
  );
};

// Progress steps component
export const ProgressSteps: React.FC<{ 
  steps: string[]; 
  currentStep: number;
  aiMode?: boolean;
}> = ({ steps, currentStep, aiMode = false }) => {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
              }
              ${index === currentStep ? 'animate-pulse' : ''}
            `}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`
              text-xs mt-1 text-center
              ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'}
            `}>
              {step}
            </span>
          </div>
        ))}
      </div>
      
      {/* Progress line */}
      <div className="relative">
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200"></div>
        <div 
          className="absolute top-4 left-4 h-0.5 bg-blue-600 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      {aiMode && currentStep === steps.length - 1 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            <Brain className="w-4 h-4 mr-1 animate-pulse" />
            AI Analysis in Progress
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
