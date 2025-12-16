import { createFileRoute, useNavigate } from "@tanstack/solid-router"
import { Link } from "@tanstack/solid-router"
import { createSignal } from "solid-js"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/auth/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = createSignal("")
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal("")

  const handleRegister = async (e: Event) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authClient.signUp.email({
        email: email(),
        password: password(),
        name: name(),
      }, {
        onSuccess: () => {
          navigate({ to: "/auth/workspace-setup" })
        },
        onError: (ctx) => {
          setError(ctx.error.message)
          setLoading(false)
        }
      })
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div class="flex items-center justify-center min-h-screen bg-background">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle class="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your email below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} class="grid gap-4">
            <div class="grid gap-2">
                <Label for="name">Name</Label>
                <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    value={name()}
                    onInput={(e) => setName(e.currentTarget.value)}
                />
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                required 
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div class="grid gap-2">
              <Label for="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            {error() && (
                <div class="text-sm text-red-500 font-medium">
                    {error()}
                </div>
            )}
            <Button class="w-full" type="submit" disabled={loading()}>
                {loading() ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <div class="text-sm text-center text-muted-foreground">
             Already have an account?{" "}
            <Link to="/auth/login" class="underline hover:text-primary">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
