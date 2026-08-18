import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-white rounded-lg border border-gray-200">
      <Loader2 className="h-6 w-6 text-blue-600 animate-spin mb-3" />
      <h3 className="text-[13px] font-medium text-gray-900">Loading data</h3>
      <p className="text-[12px] text-gray-500 mt-1">Please wait while we fetch the information.</p>
    </div>
  );
}
