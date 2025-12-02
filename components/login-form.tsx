"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { InfoIcon } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, profile, user } = useAuth();
  const shouldRedirectRef = useRef(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    shouldRedirectRef.current = false;

    try {
      await signIn(username, password);
      // Mark that we should redirect when profile loads
      shouldRedirectRef.current = true;
    } catch (error: unknown) {
      // Display user-friendly error messages without technical details
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid username or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in.');
        } else {
          setError('Unable to log in. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
      shouldRedirectRef.current = false;
    }
  };

  // Handle redirect after profile loads
  useEffect(() => {
    // Redirect if we have a user and profile
    if (user && profile) {
      const redirect = searchParams.get('redirect');

      if (redirect) {
        router.push(redirect);
      } else {
        // Default redirects based on role
        if (profile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.role === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }
      // Reset loading state
      setIsLoading(false);
    }
  }, [profile, user, router, searchParams]);

  const handleDemoLogin = (demoUsername: string, demoPassword: string) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="demo_student"
                  required
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "login-error" : undefined}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "login-error" : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                <div
                  id="login-error"
                  className="rounded-md border border-red-200 bg-red-50 p-3"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>

          {/* Demo Credentials Below Login Button */}
          <div className="mt-6 rounded-lg border border-blue-400 bg-blue-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <InfoIcon className="h-4 w-4 text-blue-700" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-blue-950">Demo Accounts</h3>
            </div>
            <p className="text-xs text-blue-800 mb-3">Click to populate the login form:</p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left border-blue-400 hover:bg-blue-200"
                onClick={() => handleDemoLogin('demo_student', 'demo123')}
                aria-label="Use demo student credentials"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-blue-950">Student Account</span>
                  <span className="text-xs text-blue-700">demo_student / demo123</span>
                </div>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left border-blue-400 hover:bg-blue-200"
                onClick={() => handleDemoLogin('demo_teacher', 'demo123')}
                aria-label="Use demo teacher credentials"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-blue-950">Teacher Account</span>
                  <span className="text-xs text-blue-700">demo_teacher / demo123</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
