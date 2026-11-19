"use client";

import ShinyText  from "@/components/ui/shiny-text";
import { cn } from "@/lib/utils";

// One shared title for every section, so the style stays identical everywhere.
export function SectionTitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "font-heading text-6xl font-semibold tracking-tighter",
        className,
      )}
    >
      <ShinyText
  text= {text}
  color="#b5b5b5"
  shineColor="#ffffff"
  speed={4}
  shineWidth={40}
  softness={0.8}
  trigger="loop"
  delay={0}
  angle={120}
  bands={1}
  glow={0.5}
  direction="right"
  easing="smooth"
  yoyo={false}
  followPointer={false}
  pauseOnHover={false}
  disabled={false}
/>
    </h2>
  );
}