"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label shown in the error card (e.g. "Analytics") */
  section?: string;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[240px] rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="text-foreground font-semibold mb-1">
            {this.props.section ? `${this.props.section} failed to load` : "Something went wrong"}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-xs">
            {this.state.error.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-sm text-foreground hover:border-primary/40 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
