'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log to external error tracking service (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-700">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">عذراً، حدث خطأ ما</h1>
                    <p className="text-red-50 text-sm">Oops! Something went wrong</p>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    نعتذر عن هذا الإزعاج. حدث خطأ غير متوقع في التطبيق. فريقنا تم إبلاغه
                    تلقائياً وسنعمل على حل المشكلة في أقرب وقت ممكن.
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm font-mono text-red-800 dark:text-red-300 mb-2">
                        <strong>Error:</strong> {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-700 dark:text-red-400 cursor-pointer hover:underline">
                            عرض التفاصيل التقنية (Stack Trace)
                          </summary>
                          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto max-h-64 p-3 bg-white dark:bg-slate-900 rounded-lg border border-red-200 dark:border-red-800">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>المحاولة مرة أخرى</span>
                  </button>

                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-all"
                  >
                    <Home className="w-5 h-5" />
                    <span>العودة للرئيسية</span>
                  </Link>
                </div>

                {/* Support Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني على{' '}
                    <a
                      href="mailto:support@samalogistics.com"
                      className="text-brand-orange hover:underline font-medium"
                    >
                      support@samalogistics.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Decoration */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 dark:text-gray-600 text-sm">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
