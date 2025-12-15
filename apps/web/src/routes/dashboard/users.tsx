import { createFileRoute } from "@tanstack/solid-router"

export const Route = createFileRoute("/dashboard/users")({
  component: UsersPage,
})

function UsersPage() {
  return (
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div class="grid auto-rows-min gap-4 md:grid-cols-3">
        <div class="aspect-video rounded-xl bg-muted/50" />
        <div class="aspect-video rounded-xl bg-muted/50" />
        <div class="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50">
        <div class="p-6">
          <h2 class="text-2xl font-bold tracking-tight">User Management</h2>
          <p class="text-muted-foreground">Manage your users here.</p>
        </div>
      </div>
    </div>
  )
}
