import { ErrorBoundary as SolidErrorBoundary, type JSX } from "solid-js"
import { Button } from "./ui/button"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { AlertCircle } from "lucide-solid"

interface ErrorBoundaryProps {
  children: JSX.Element
  fallback?: (error: Error, reset: () => void) => JSX.Element
}

export function ErrorBoundary(props: ErrorBoundaryProps) {
  const defaultFallback = (error: Error, reset: () => void) => (
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription class="mt-2">
            <p class="text-sm">{error.message || "An unexpected error occurred"}</p>
            {import.meta.env.DEV && (
              <details class="mt-2">
                <summary class="cursor-pointer text-xs">Error details</summary>
                <pre class="mt-2 overflow-auto rounded bg-black/10 p-2 text-xs">
                  {error.stack}
                </pre>
              </details>
            )}
          </AlertDescription>
        </Alert>
        <div class="flex gap-2">
          <Button onClick={reset} class="flex-1">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard")}
            class="flex-1"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <SolidErrorBoundary fallback={props.fallback || defaultFallback}>
      {props.children}
    </SolidErrorBoundary>
  )
}
