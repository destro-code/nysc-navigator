import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class RuntimeErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("NYSC Navigator runtime error:", error, info.componentStack);
  }

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <main className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-destructive">Application error</p>
          <h1 className="mt-2 text-2xl font-semibold">NYSC Navigator could not load.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The application started, but a frontend runtime error stopped React from rendering the page.
          </p>
          <pre className="mt-5 max-h-56 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap break-words">
            {this.state.error.message || String(this.state.error)}
          </pre>
          <div className="mt-5 flex gap-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" onClick={this.handleReload}>
              Reload
            </button>
            <button className="rounded-lg border px-4 py-2 text-sm font-medium" onClick={() => { window.location.href = "/login"; }}>
              Go to login
            </button>
          </div>
        </main>
      </div>
    );
  }
}
