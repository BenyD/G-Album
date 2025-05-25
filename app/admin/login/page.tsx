import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <h1 className="text-red-600 font-bold text-3xl text-center mb-2">G Album</h1>
            <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-red-600 hover:text-red-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-600"
              />
              <Label htmlFor="remember" className="text-sm text-slate-500">
                Remember me
              </Label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full bg-red-600 hover:bg-red-700 text-white">
              <Link href="/admin/dashboard">Sign in</Link>
            </Button>

            <Link href="/" className="text-sm text-center text-slate-500 hover:text-red-600 transition-colors">
              ← Back to website
            </Link>
          </CardFooter>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">G Album Admin Portal © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
