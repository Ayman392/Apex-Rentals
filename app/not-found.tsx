import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-6 pt-24 text-center">
      <div className="glass w-full rounded-2xl p-8 sm:p-10">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/15 text-coral-text">
          <Compass className="size-6" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral-text">
          404 Error
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page or equipment listing you are looking for does not exist or may
          have been moved.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(
              buttonVariants(),
              "shadow-coral rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90",
            )}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>

          <Link
            href="/equipment"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "rounded-full px-6",
            )}
          >
            Browse Equipment
          </Link>
        </div>
      </div>
    </div>
  );
}