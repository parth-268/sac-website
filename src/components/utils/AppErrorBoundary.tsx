import React from "react";

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // You can later wire this to Sentry / LogRocket
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
          <div>
            <h1 className="text-xl font-heading font-bold mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mb-4">
              Please refresh the page. If the problem persists, contact the
              admin.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-primary font-medium"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
