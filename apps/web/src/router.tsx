import { createRouter, type ErrorRouteComponent } from '@tanstack/solid-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: (({ error }) => {
      return (
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="w-full max-w-md space-y-4">
            <div class="rounded-lg border border-red-200 bg-red-50 p-4">
              <h2 class="text-lg font-semibold text-red-900">Error</h2>
              <p class="mt-2 text-sm text-red-700">
                {error.message || "An unexpected error occurred"}
              </p>
              {import.meta.env.DEV && error.stack && (
                <details class="mt-2">
                  <summary class="cursor-pointer text-xs text-red-600">
                    Error details
                  </summary>
                  <pre class="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              class="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }) satisfies ErrorRouteComponent,
  })
  return router
}
