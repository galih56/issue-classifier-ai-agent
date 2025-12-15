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

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = createSignal("")
  const [password, setPassword] = createSignal("")
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal("")

  const handleLogin = async (e: Event) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await authClient.signIn.email({
        email: email(),
        password: password(),
      }, {
        onSuccess: () => {
            navigate({ to: "/dashboard" })
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
          <CardTitle class="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} class="grid gap-4">
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
                {loading() ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter class="flex flex-col gap-2">
          <div class="text-sm text-center text-muted-foreground">
             Don't have an account?{" "}
            <Link to="/auth/register" class="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
