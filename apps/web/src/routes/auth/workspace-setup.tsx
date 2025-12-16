import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-solid"

export const Route = createFileRoute("/auth/workspace-setup")({
  component: WorkspaceSetupPage,
})

function WorkspaceSetupPage() {
  const navigate = useNavigate()
  const [workspaceName, setWorkspaceName] = createSignal("")
  const [workspaceDescription, setWorkspaceDescription] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal("")

  const handleCreateWorkspace = async (e: Event) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data: tokenData, error: tokenError } = await authClient.token()
      if (tokenError || !tokenData?.token) {
        setError("Authentication failed. Please login again.")
        setLoading(false)
        return
      }

      const response = await fetch(`${import.meta.env.VITE_RESOURCE_API_URL}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          name: workspaceName(),
          description: workspaceDescription(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create workspace")
      }

      navigate({ to: "/dashboard" })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate({ to: "/auth/register" })
  }

  return (
    <div class="flex items-center justify-center min-h-screen bg-background p-4">
      <Card class="w-full max-w-2xl">
        <CardHeader class="space-y-4">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-primary/10 rounded-lg">
              <Building2 class="w-8 h-8 text-primary" />
            </div>
            <div>
              <CardTitle class="text-3xl">Create your workspace</CardTitle>
              <CardDescription class="text-base mt-1">
                Let's set up your environment to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateWorkspace} class="space-y-6">
            <div class="space-y-2">
              <Label for="workspace-name" class="text-base font-medium">
                Workspace Name
              </Label>
              <Input
                id="workspace-name"
                type="text"
                placeholder="Acme Inc."
                required
                value={workspaceName()}
                onInput={(e) => setWorkspaceName(e.currentTarget.value)}
                class="h-12"
              />
              <p class="text-sm text-muted-foreground">
                This will be the name of your team or company workspace
              </p>
            </div>

            <div class="space-y-2">
              <Label for="workspace-description" class="text-base font-medium">
                What you expect from this AI Agent workspace?
              </Label> 
              <br/>
              <span class="text-sm text-muted-foreground">
                This description will be used for AI Agent to understand your workspace
              </span>
              <Textarea
                id="workspace-description"
                placeholder="Write your first prompt here"
                required
                value={workspaceDescription()}
                onInput={(e) => setWorkspaceDescription(e.currentTarget.value)}
                class="min-h-[120px] resize-none"
              />
              {!workspaceDescription() && (
                <p class="text-sm text-destructive">Please fill out this field.</p>
              )}
            </div>

            {error() && (
              <div class="text-sm text-red-500 font-medium p-3 bg-red-50 rounded-md">
                {error()}
              </div>
            )}

            <div class="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                class="flex-1 h-12"
                disabled={loading()}
              >
                Back
              </Button>
              <Button
                type="submit"
                class="flex-1 h-12"
                disabled={loading() || !workspaceName() || !workspaceDescription()}
              >
                {loading() ? "Creating Workspace..." : "Create Workspace"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
