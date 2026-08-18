import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full bg-white rounded-lg border border-gray-200 border-dashed p-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 mb-3">
        <FolderOpen className="h-5 w-5 text-gray-500" />
      </div>
      <h3 className="text-[13px] font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-[12px] text-gray-500 mb-4 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
