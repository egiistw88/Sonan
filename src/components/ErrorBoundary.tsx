
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm">
            <div className="text-6xl mb-6">🤕</div>
            <h1 className="text-white font-black text-xl mb-2">Waduh, Aplikasi Keseleo!</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Mohon maaf, terjadi kesalahan teknis. Tenang, data Anda aman. Silakan coba muat ulang.
            </p>
            
            {(import.meta as any).env?.DEV && (
                <div className="bg-red-900/20 text-red-400 p-2 text-xs font-mono text-left mb-4 rounded overflow-auto max-h-32">
                    {this.state.error?.toString()}
                </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              🔄 COBA LAGI (REFRESH)
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
