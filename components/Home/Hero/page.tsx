"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { SectionTitle } from "@/components/ui/section-title";
import Image from "next/image";

const IMAGES = [
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=80",
];

// Camera travel in px. Perspective is 900, so END_Z must stay below it.
const START_Z = -2400;
const END_Z = 500;
const DURATION = 20000; // ms for one photo to travel the whole distance
const DESIGN_WIDTH = 1280; // width the lane offsets below were designed for

// Smooth ease-out: quick start, soft landing. No bounce.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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
  const reduceMotion = useReducedMotion();

  // Text entrance: restrained, staggered, no movement for reduced-motion users
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
  };

  const rise: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE },
    },
  };

  // Headline lines slide up from behind a mask
  const lineUp: Variants = {
    hidden: { y: reduceMotion ? 0 : "105%", opacity: reduceMotion ? 0 : 1 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.75, ease: EASE },
    },
  };

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
        {/* Opacity-only fade-in so it never fights the stream's own motion */}
        <motion.div
          ref={stageRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
          className="absolute inset-0 [perspective-origin:65%_50%] [perspective:900px]"
        >
          {CARDS.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute left-[65%] top-1/2 overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border will-change-transform"
              style={{
                width: card.w,
                height: card.h,
                marginLeft: -card.w / 2,
                marginTop: -card.h / 2,
                opacity: 0,
              }}
            >
              <Image
                width={900}
                height={900}
                src={IMAGES[i % IMAGES.length]}
                alt=""
                loading={i < 3 ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        <motion.div
          className="max-w-xl"
          variants={container}
          initial="hidden"
          animate="show"
        >

          <h1
            id="hero-heading"
            className="mt-6 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl"
          >
            {/* Each line is masked so it slides up into place.
                The small bottom padding keeps descenders from being clipped. */}
            <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
              <motion.span className="block" variants={lineUp}>
                <SectionTitle
                  className="text-5xl md:text-7xl"
                  text="Everything you need,"
                />
              </motion.span>
            </span>
            <span className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
              <motion.span className="block text-coral-text" variants={lineUp}>
                without owning it.
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={rise}
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground"
          >
            Rent cameras, excavators, drones, tractors and event gear from
            trusted owners. Pick your dates, book in minutes and pay securely.
          </motion.p>

          <motion.div
            variants={rise}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/equipment" className="inline-block w-fit">
              <InteractiveHoverButton
                text="Browse equipment"
                dotClassName="size-2.5"
                durationClassName="duration-300"
                className="h-11 w-52"
              />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}