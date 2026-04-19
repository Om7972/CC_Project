import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="rounded-3xl border border-rose-500/40 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-2 text-slate-400">Try refreshing this page.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
