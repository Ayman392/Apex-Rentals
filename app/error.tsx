"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-6 pt-24 text-center">
      <div className="glass w-full rounded-2xl p-8 sm:p-10">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-500">
          <AlertTriangle className="size-6" />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {error.message ||
            "An unexpected error occurred while loading this page. Please try again."}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            type="button"
            onClick={() => reset()}
            className="shadow-coral rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
          >
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>

          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full px-6",
            )}
          >
            <Home className="mr-2 size-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}