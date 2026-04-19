import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-black text-white">404</h1>
      <p className="mt-2 text-slate-400">This route does not exist.</p>
      <Link to="/" className="mt-6 rounded-2xl bg-cyan-400 px-5 py-2 font-semibold text-slate-950">Back home</Link>
    </div>
  );
}
