import { Component } from "react";
import toast from "react-hot-toast";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message || "Unknown error" };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🔴 App crashed:", error, errorInfo);
    toast.error("An unexpected error occurred", { duration: 5000 });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-base-100">
          <div className="max-w-md text-center bg-base-200 p-8 rounded-lg shadow-xl">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-error mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-4">{this.state.errorMessage}</p>
            <p className="text-xs text-muted-foreground mb-6">An unexpected error occurred. Try refreshing the page.</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary btn-sm"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className="btn btn-ghost btn-sm"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
