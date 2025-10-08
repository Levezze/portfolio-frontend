"use client";

import type React from "react";
import { Component, type ReactNode } from "react";

interface Scene3DErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
  retryCount: number;
}

interface Scene3DErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
}

export class Scene3DErrorBoundary extends Component<
  Scene3DErrorBoundaryProps,
  Scene3DErrorBoundaryState
> {
  private maxRetries: number;

  constructor(props: Scene3DErrorBoundaryProps) {
    super(props);

    this.maxRetries = props.maxRetries || 2;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<Scene3DErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error details
    console.error("3D Scene Error Boundary caught an error:", error);
    console.error("Error details:", errorInfo);

    // Check if it's a WebGL-related error
    const isWebGLError =
      error.message.includes("WebGL") ||
      error.message.includes("canvas") ||
      error.message.includes("context") ||
      error.stack?.includes("three") ||
      error.stack?.includes("r3f");

    if (isWebGLError) {
      console.warn("WebGL-related error detected in 3D scene");
    }

    this.setState({
      errorInfo: errorInfo.componentStack || null,
      error,
    });

    // Auto-retry for certain recoverable errors
    if (this.state.retryCount < this.maxRetries && isWebGLError) {
      setTimeout(() => {
        this.handleRetry();
      }, 2000);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      console.log(
        `Retrying 3D scene (attempt ${this.state.retryCount + 1}/${this.maxRetries})`,
      );

      this.setState((prevState) => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleForceRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const _canRetry = this.state.retryCount < this.maxRetries;
      const _isWebGLError =
        this.state.error?.message.includes("WebGL") ||
        this.state.error?.message.includes("canvas") ||
        this.state.error?.message.includes("context") ||
        this.state.error?.stack?.includes("three");

      return (
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <div className="text-xl font-semibold text-foreground mb-2">
              Graphics Error
            </div>
            <p className="text-muted-foreground mb-4">
              3D graphics failed to load. Try refreshing the page.
            </p>
            <button
              onClick={this.handleForceRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
