'use client';

import { useFallbackMode } from '@/lib/AppWrapper';
import { AlertTriangle } from 'lucide-react';

export default function FallbackBanner() {
  const isFallback = useFallbackMode();

  if (!isFallback) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 px-4 py-7 border-1 bg-red-100 border-red-300 text-red-600 rounded-2xl animate-pulse">
        <AlertTriangle className="w-5 h-5 text-red-700" />
        <span className="text-sm font-medium">Fallback mode enabled. Failure of health check indicates that the API server is unavailable</span>
      </div>
    </div>
  );
}
