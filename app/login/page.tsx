"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";

function GoogleLogo() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg
      className="h-4 w-4 shrink-0 fill-current"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null,
  );

  const isBusy = loading || socialLoading !== null;

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn.email({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Invalid email or password.");
      return;
    }

    toast.success("Logged in successfully!");
    router.push(callbackUrl);
    router.refresh();
  }

  async function handleSocialLogin(provider: "google" | "github") {
    setSocialLoading(provider);
    const { error } = await signIn.social({
      provider,
      callbackURL: callbackUrl,
    });

    if (error) {
      setSocialLoading(null);
      toast.error(error.message || `Failed to sign in with ${provider}.`);
    }
  }

  return (
    <div className="glass w-full max-w-[400px] rounded-[22px] p-5 text-card-foreground sm:p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Log in to rent equipment and manage your bookings.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailLogin} className="mt-5 space-y-3">
        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-foreground"
          >
            Email address
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3 py-1.5 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-xs font-medium text-foreground"
          >
            Password
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3 py-1.5 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isBusy}
          className="shadow-coral mt-1 flex h-9 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {/* OR Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium tracking-wider text-muted-foreground">
          OR
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Social Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isBusy}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          <GoogleLogo />
          {socialLoading === "google"
            ? "Redirecting to Google..."
            : "Continue with Google"}
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin("github")}
          disabled={isBusy}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
        >
          <GitHubLogo />
          {socialLoading === "github"
            ? "Redirecting to GitHub..."
            : "Continue with GitHub"}
        </button>
      </div>

      {/* Footer Link */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-coral-text hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20 pb-6">
      <Suspense
        fallback={
          <div className="text-xs text-muted-foreground">Loading...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}