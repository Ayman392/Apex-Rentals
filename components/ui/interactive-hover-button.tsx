import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  dotClassName?: string;
  durationClassName?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(
  (
    {
      text = "Button",
      className,
      dotClassName = "size-2.5",
      durationClassName = "duration-300",
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const label =
      typeof children === "string" || typeof children === "number"
        ? String(children)
        : text;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "group relative inline-flex h-11 min-w-36 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {/* Resting label */}
        <span
          className={cn(
            "relative z-10 inline-flex items-center pl-2 ease-out motion-reduce:transition-none group-hover:translate-x-10 group-hover:opacity-0",
            durationClassName,
            "transition-all",
          )}
        >
          {label}
        </span>

        {/* Hover label + arrow */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 flex translate-x-10 items-center justify-center gap-2 text-primary-foreground opacity-0 ease-out motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100",
            durationClassName,
            "transition-all",
          )}
        >
          <span>{label}</span>
          <ArrowRight
            className={cn(
              "size-4 shrink-0 translate-x-0 ease-out motion-reduce:transition-none group-hover:translate-x-0.5",
              durationClassName,
              "transition-transform",
            )}
          />
        </div>

        {/* Expanding accent dot */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-5 top-1/2 z-0 -translate-y-1/2 rounded-full bg-primary ease-out motion-reduce:transition-none group-hover:left-0 group-hover:top-0 group-hover:h-full group-hover:w-full group-hover:translate-y-0 group-hover:rounded-full",
            dotClassName,
            durationClassName,
            "transition-all",
          )}
        />
      </button>
    );
  },
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };