"use client";

import { cn } from "@/lib/utils";

interface IOSSpinnerProps {
  size?: number;
  className?: string;
}

export function IOSSpinner({ size = 28, className }: IOSSpinnerProps) {
  const blades = Array.from({ length: 12 });

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={cn("relative inline-block text-foreground", className)}
    >
      {blades.map((_, i) => (
        <span
          key={i}
          style={{
            transform: `rotate(${i * 30}deg) translate(0, -130%)`,
            animation: "ios-spinner-fade 1s linear infinite",
            animationDelay: `${-((12 - i) / 12)}s`,
          }}
          className="absolute left-1/2 top-1/2 h-[26%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current"
        />
      ))}
    </div>
  );
}