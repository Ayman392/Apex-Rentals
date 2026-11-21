"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ShieldCheck } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

const IMAGES = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `/demo/${n}.jpg`);

// Camera travel in px. Perspective is 900, so END_Z must stay below it.
const START_Z = -2400;
const END_Z = 500;
const DURATION = 20000; // ms for one photo to travel the whole distance
const DESIGN_WIDTH = 1280; // width the lane offsets below were designed for

// x/y: offset from the vanishing point, w/h: card size, rot: tilt, offset: start phase (0..1)
const CARDS = [
  { x: -40, y: -250, w: 220, h: 270, rot: -4, offset: 0.0 },
  { x: 300, y: -140, w: 200, h: 250, rot: 5, offset: 0.11 },
  { x: 460, y: 80, w: 230, h: 280, rot: -6, offset: 0.22 },
  { x: 160, y: 230, w: 210, h: 260, rot: 4, offset: 0.33 },
  { x: -230, y: 150, w: 200, h: 250, rot: -3, offset: 0.44 },
  { x: -360, y: -80, w: 220, h: 270, rot: 6, offset: 0.55 },
  { x: 540, y: -260, w: 200, h: 250, rot: -5, offset: 0.66 },
  { x: 60, y: -30, w: 190, h: 240, rot: 3, offset: 0.77 },
  { x: 380, y: 260, w: 220, h: 270, rot: -4, offset: 0.88 },
] as const;

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let t = motionQuery.matches ? DURATION * 0.35 : 0;
    let last = performance.now();
    let scale = 1;
    let inView = true;
    let tabVisible = !document.hidden;
    let raf = 0;

    const render = () => {
      CARDS.forEach((card, i) => {
        const el = cardRefs.current[i];
        if (!el) return;

        const p = (t / DURATION + card.offset) % 1;
        const z = START_Z + p * (END_Z - START_Z);
        const fadeIn = Math.min(1, p / 0.18);
        const fadeOut = Math.min(1, (1 - p) / 0.12);

        el.style.opacity = String(Math.max(0, Math.min(fadeIn, fadeOut)));
        el.style.transform = `translate3d(${card.x * scale}px, ${card.y * scale}px, ${z}px) rotate(${card.rot}deg) scale(${scale})`;
        el.style.zIndex = String(Math.round(p * 100));
      });
    };

    const measure = () => {
      scale = Math.min(1, Math.max(0.55, stage.clientWidth / DESIGN_WIDTH));
      render();
    };

    const tick = (now: number) => {
      if (inView && tabVisible) {
        t += now - last;
        render();
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      if (!motionQuery.matches) raf = requestAnimationFrame(tick);
    };

    const onMotionChange = () => {
      if (motionQuery.matches) t = DURATION * 0.35;
      render();
      start();
    };

    const onVisibility = () => {
      tabVisible = !document.hidden;
      last = performance.now();
    };

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        last = performance.now();
      },
      { threshold: 0 },
    );
    intersectionObserver.observe(stage);

    motionQuery.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);

    measure();
    start();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[calc(100svh-6rem)] items-center overflow-hidden"
    >
      {/* Soft glow behind the stream */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 -z-20 size-[60rem] -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Photo stream: fades out behind the text on desktop, dimmed on mobile */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent_20%,black_55%)] max-md:opacity-35 max-md:[mask-image:none]"
      >
        <div
          ref={stageRef}
          className="absolute inset-0 [perspective-origin:65%_50%] [perspective:900px]"
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-[65%] top-1/2 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-border will-change-transform"
              style={{
                width: card.w,
                height: card.h,
                marginLeft: -card.w / 2,
                marginTop: -card.h / 2,
                opacity: 0,
              }}
            >
              <Image
                src={IMAGES[i % IMAGES.length]}
                alt=""
                fill
                sizes="240px"
                className="object-cover"
                priority={i < 3}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <div className="max-w-xl">
          <span className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-3.5 text-coral-text" />
            Verified owners, secure payments
          </span>

          <h1
            id="hero-heading"
            className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
          >
            Everything you need,
            <br />
            <span className="text-coral-text">without owning it.</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Rent cameras, excavators, drones, tractors and event gear from
            trusted owners. Pick your dates, book in minutes and pay securely.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/equipment" className="inline-block w-fit">
              <InteractiveHoverButton
                text="Browse equipment"
                dotClassName="size-2.5"
                durationClassName="duration-300"
                className="h-11 w-52"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}