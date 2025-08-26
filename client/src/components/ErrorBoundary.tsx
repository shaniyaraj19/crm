import React, { useState, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  useEffect(() => {
    if (errorState.hasError) {
      console.error("ErrorBoundary caught an error:", errorState.error);
    }
  }, [errorState]);

  const resetError = () => {
    setErrorState({ hasError: false });
  };

  if (errorState.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-4">
            We're sorry, but something unexpected happened.
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Custom hook to handle errors
const useErrorBoundary = () => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const handleError = (error: Error) => {
    setErrorState({ hasError: true, error });
  };

  const resetError = () => {
    setErrorState({ hasError: false });
  };

  return { errorState, handleError, resetError };
};

// Enhanced ErrorBoundary with error handling
const EnhancedErrorBoundary: React.FC<Props> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const handleError = (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    setErrorState({ hasError: true, error });
  };

  const resetError = () => {
    setErrorState({ hasError: false });
  };

  // Error boundary effect
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason));
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (errorState.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <svg
              className="mx-auto h-12 w-12 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-muted-foreground mb-6">
            {errorState.error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default EnhancedErrorBoundary;
