"use client";

import { Wrench } from "lucide-react";

export default function VMDashboard() {

  return (
     <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 px-4">
      <Wrench className="w-16 h-16 text-gray-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Under Maintenance</h1>
      <p className="text-center text-gray-600 max-w-md">
        The minecraft server is undergoing upgrades and changes. Check back again later.
      </p>
    </div>
  );
}