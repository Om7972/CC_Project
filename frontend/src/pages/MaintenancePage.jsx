import React from 'react';

export function MaintenancePage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Maintenance Mode</h1>
        <p className="mt-2 text-slate-400">We are applying updates. Please check back shortly.</p>
      </div>
    </div>
  );
}
