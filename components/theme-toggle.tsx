"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-8 w-16 rounded-full bg-foreground/[0.04] ring-1 ring-border",
          className
        )}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex h-8 w-16 cursor-pointer items-center rounded-full p-1 ring-1 ring-border transition-all duration-300",
        isDark
          ? "bg-foreground/5 hover:bg-foreground/10"
          : "bg-foreground/[0.04] hover:bg-foreground/[0.07]",
        className
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
            isDark
              ? "translate-x-0 bg-foreground/15 ring-1 ring-border"
              : "translate-x-8 bg-white shadow-sm ring-1 ring-black/5"
          )}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
          ) : (
            <Sun className="h-3.5 w-3.5 text-foreground" strokeWidth={1.75} />
          )}
        </div>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
            isDark ? "translate-x-0" : "-translate-x-8"
          )}
        >
          {isDark ? (
            <Sun className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          ) : (
            <Moon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
          )}
        </div>
      </div>
    </button>
  );
}