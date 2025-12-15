import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import TanStackQueryProvider from '../integrations/tanstack-query/provider.tsx'
import { ErrorBoundary } from '../components/error-boundary.tsx'

import '@fontsource/inter/500.css'

import { HydrationScript } from 'solid-js/web'
import { Suspense } from 'solid-js'



import styleCss from './../styles.css?url'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: styleCss }],
  }),
  shellComponent: RootComponent,
})

function RootComponent() {
  return (
    <html>
      <head>
        <HydrationScript />
      </head>
      <body>
        <HeadContent />
        <Suspense>
          <TanStackQueryProvider>
            <ErrorBoundary>
              <Outlet />
              <TanStackRouterDevtools />
            </ErrorBoundary>
          </TanStackQueryProvider>
        </Suspense>
        <Scripts />
      </body>
    </html>
  )
}
