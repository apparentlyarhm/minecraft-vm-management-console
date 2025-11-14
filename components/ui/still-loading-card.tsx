'use client';
import { Info } from 'lucide-react';

export default function StillLoadingCard() {
  // unlike the fallback card, the parent component decides when to show this card
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 px-4 py-7 border-1 bg-blue-100 border-blue-300 text-blue-600 rounded-2xl">
        <Info className="w-5 h-5 text-blue-700" />
        <span className="text-sm font-medium">It looks like the API server might be starting up. Please wait</span>
      </div>
    </div>
  );
}
