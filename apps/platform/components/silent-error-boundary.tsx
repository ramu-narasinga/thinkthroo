"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Silently catches any render errors (e.g. tRPC UNAUTHORIZED) so the
// blurred preview doesn't crash — it just shows whatever rendered before the error.
export class SilentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // swallow silently
  }

  render() {
    if (this.state.hasError) {
      // Show a generic skeleton if the real content fully crashes
      return (
        <div className="p-8 space-y-6">
          <div className="h-8 w-56 bg-gray-300 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32" />
            ))}
          </div>
          <div className="bg-gray-200 rounded-xl h-48" />
          <div className="bg-gray-200 rounded-xl h-48" />
        </div>
      );
    }

    return this.props.children;
  }
}
