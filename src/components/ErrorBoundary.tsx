import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-red-500 p-8 font-mono flex flex-col items-start justify-center">
          <h1 className="text-3xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-xl mb-4">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-xs bg-slate-900 p-4 rounded overflow-auto w-full max-w-4xl">
            {this.state.errorInfo?.componentStack}
          </pre>
          <button 
            className="mt-6 px-4 py-2 bg-slate-800 text-slate-200 rounded hover:bg-slate-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
