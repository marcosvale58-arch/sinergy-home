'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isExtensionError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isExtensionError: false,
  };

  public componentDidMount() {
    if (typeof window !== 'undefined') {
      const handleGlobalError = (event: ErrorEvent) => {
        const isExtension = 
          event.filename?.startsWith('chrome-extension://') ||
          event.filename?.startsWith('moz-extension://') ||
          event.error?.stack?.includes('chrome-extension://') ||
          event.error?.stack?.includes('moz-extension://') ||
          event.message?.includes('M_ID');

        if (isExtension) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const stack = event.reason?.stack || '';
        const message = event.reason?.message || '';
        if (
          stack.includes('chrome-extension://') ||
          stack.includes('moz-extension://') ||
          message.includes('M_ID')
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      };

      window.addEventListener('error', handleGlobalError, true);
      window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    const isExtension = 
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('moz-extension://') ||
      error.message?.includes('M_ID');

    if (isExtension) {
      return { hasError: false, isExtensionError: true };
    }
    return { hasError: true, isExtensionError: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isExtension = 
      error.stack?.includes('chrome-extension://') ||
      error.stack?.includes('moz-extension://') ||
      error.message?.includes('M_ID');

    if (isExtension) {
      console.warn("Ignored third-party browser extension error:", error.message);
      this.setState({ hasError: false, isExtensionError: true });
      return;
    }
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Algo salió mal</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Por favor recarga la página para continuar.</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition"
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

