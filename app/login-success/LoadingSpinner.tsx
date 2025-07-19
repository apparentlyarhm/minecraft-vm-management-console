"use client";

import { RotateCw } from "lucide-react";

// ideally this should go in the components folder but this is something that is used here only... 

export default function LoadingSpinner({ message = "Logging in..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-4">
        <RotateCw className="animate-spin text-4xl text-black" />
        <span className="text-black text-sm font-semibold font-ember">
          {message}
        </span>
      </div>
    </div>
  );
}
