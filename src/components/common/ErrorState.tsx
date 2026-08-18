import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-white rounded-lg border border-red-100 p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
      </div>
      <h3 className="text-[13px] font-semibold text-gray-900 mb-1">Error Loading Data</h3>
      <p className="text-[12px] text-gray-500 mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center px-3 py-1.5 text-[12px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
