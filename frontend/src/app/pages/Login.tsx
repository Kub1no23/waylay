import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { EyeIcon, EyeOffIcon, Loader2Icon } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      // Simulated login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Example: store auth state
      localStorage.setItem("token", "mock-token");

      navigate("/"); // react-router-dom navigation
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          WayLay
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Where talent gets discovered
        </p>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>

                {/* FIX: Link uses "to", not href */}
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-accent"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex-col gap-4 pt-0">
          <Button variant="outline" className="w-full" asChild>
            {/* FIX: Link uses "to" */}
            <Link to="/register">Create an account</Link>
          </Button>
        </CardFooter>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link to="/terms" className="underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
