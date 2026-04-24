import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Also log to console for developer visibility
    console.error('Uncaught error in React tree:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-red-200 p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-3">Something went wrong</h2>
            <p className="text-sm text-slate-600 mb-4">An unexpected error occurred while rendering the application. Details are shown below for debugging.</p>
            <pre className="text-xs text-red-700 overflow-auto max-h-64 bg-red-50 p-3 rounded">
              {String(this.state.error && this.state.error.toString())}
              {this.state.info?.componentStack}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
