import { createFileRoute, Outlet, useNavigate } from "@tanstack/solid-router"
import { authClient } from "@/lib/auth-client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { createEffect, createSignal, Show } from "solid-js"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = createSignal<boolean | null>(null)

  createEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession()
        if (!session) {
          navigate({ to: "/auth/login" })
          setIsAuthenticated(false)
        } else {
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        navigate({ to: "/auth/login" })
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  })

  return (
    <Show when={isAuthenticated() !== null} fallback={
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p class="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    }>
      <Show when={isAuthenticated()}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
              <SidebarTrigger class="-ml-1" />
              <Separator orientation="vertical" class="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span class="font-normal text-foreground">Dashboard</span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div class="flex flex-1 flex-col gap-4 p-4">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </Show>
    </Show>
  )
}
