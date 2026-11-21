"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Cpu,
  HardHat,
  Layers,
  MapPin,
  Sparkles,
  Tractor,
  Truck,
} from "lucide-react";
import type { Equipment } from "@/lib/equipment";
import { FALLBACK_EQUIPMENT_IMAGE } from "@/lib/constants";
import { buildEquipmentUrl } from "@/lib/slug";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";
import Image from "next/image";

const UNIT = { Daily: "day", Weekly: "week", Monthly: "month" } as const;
const AUTO_PLAY_INTERVAL = 3400;
const ITEM_HEIGHT = 64;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

function iconForCategory(category: string) {
  const c = category.toLowerCase();
  if (c.includes("construction")) return HardHat;
  if (c.includes("photo") || c.includes("camera")) return Camera;
  if (c.includes("vehicle") || c.includes("transport")) return Truck;
  if (c.includes("agri")) return Tractor;
  if (c.includes("electronic") || c.includes("drone")) return Cpu;
  if (c.includes("event") || c.includes("sound")) return Sparkles;
  return Layers;
}

function getCardStatus(index: number, currentIndex: number, total: number) {
  if (total <= 1) return index === currentIndex ? "active" : "hidden";
  const diff = index - currentIndex;
  let normalizedDiff = diff;
  if (diff > total / 2) normalizedDiff -= total;
  if (diff < -total / 2) normalizedDiff += total;

  if (normalizedDiff === 0) return "active";
  if (normalizedDiff === -1) return "prev";
  if (normalizedDiff === 1) return "next";
  return "hidden";
}

function CardPhoto({
  item,
  isActive,
}: {
  item: Equipment;
  isActive: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = failed || !item.image ? FALLBACK_EQUIPMENT_IMAGE : item.image;

  return (
    <Image
      width={600}
      height={800}
      priority={isActive}
      src={src}
      alt={item.name}
      onError={() => setFailed(true)}
      className={cn(
        "h-full w-full object-cover transition-all duration-700",
        isActive
          ? "grayscale-0 blur-0 brightness-100"
          : "grayscale blur-[2px] brightness-75",
      )}
    />
  );
}

export function FeaturedEquipment({ items }: { items: Equipment[] }) {
  const safeItems = Array.isArray(items) ? items : [];
  const list = safeItems.slice(0, 6);
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const len = list.length;
  const currentIndex = len > 0 ? ((step % len) + len) % len : 0;

  const nextStep = useCallback(() => {
    if (len > 1) {
      setStep((prev) => prev + 1);
    }
  }, [len]);

  useEffect(() => {
    if (isPaused || len <= 1) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, len]);

  const handleChipClick = (index: number) => {
    if (len <= 1) return;
    const diff = (index - currentIndex + len) % len;
    if (diff > 0) setStep((s) => s + diff);
  };

  if (len === 0) {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
          <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
            <SectionTitle text="Featured Equipment" />
            <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
              <span className="text-foreground">Equipment ready to rent</span>{" "}
              <span className="text-muted-foreground">
                from verified owners near you.
              </span>
            </p>
          </div>

          <div className="glass mt-10 flex flex-col items-center justify-center rounded-[2rem] border border-border px-6 py-14 text-center">
            <p className="font-heading text-lg font-semibold text-foreground">
              Featured equipment is temporarily unavailable
            </p>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
              We could not load featured items right now. You can still browse
              all available equipment.
            </p>
            <Link href="/equipment" className="mt-6 inline-block w-fit">
              <InteractiveHoverButton
                text="View all equipment"
                dotClassName="size-2.5"
                durationClassName="duration-300"
                className="h-11 w-52"
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const activeItem = list[currentIndex];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="Featured Equipment" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Equipment ready to rent</span>{" "}
            <span className="text-muted-foreground">
              from verified owners near you.
            </span>
          </p>
        </motion.div>

        {/* Split Feature Carousel (Light Mode: crisp light surfaces | Dark Mode: deep navy) */}
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0b1220] dark:shadow-2xl lg:rounded-[3rem]">
          <div className="flex min-h-[560px] flex-col lg:h-[580px] lg:flex-row">
            {/* Left Rail */}
            <div className="relative z-30 flex min-h-[320px] w-full flex-col items-start justify-center overflow-hidden bg-slate-50 px-6 text-slate-900 dark:bg-[#0b1220] dark:text-slate-100 sm:px-10 lg:h-full lg:w-[42%] lg:px-12">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-14 bg-gradient-to-b from-slate-50 via-slate-50/85 to-transparent dark:from-[#0b1220] dark:via-[#0b1220]/85" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-14 bg-gradient-to-t from-slate-50 via-slate-50/85 to-transparent dark:from-[#0b1220] dark:via-[#0b1220]/85" />

              <div className="relative z-20 flex h-full w-full items-center justify-center lg:justify-start">
                {list.map((equipment, index) => {
                  const isActive = index === currentIndex;
                  const distance = index - currentIndex;
                  const wrappedDistance =
                    len > 2 ? wrap(-(len / 2), len / 2, distance) : distance;
                  const Icon = iconForCategory(equipment.category);

                  return (
                    <motion.div
                      key={equipment._id}
                      style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                      animate={{
                        y: wrappedDistance * ITEM_HEIGHT,
                        opacity: Math.max(
                          0.28,
                          1 - Math.abs(wrappedDistance) * 0.22,
                        ),
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 95,
                        damping: 22,
                        mass: 1,
                      }}
                      className="absolute flex items-center justify-start"
                    >
                      <button
                        type="button"
                        onClick={() => handleChipClick(index)}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                        className={cn(
                          "group relative flex max-w-[20rem] items-center gap-3 rounded-full border px-5 py-3 text-left transition-all duration-500 sm:max-w-[22rem] sm:px-6",
                          isActive
                            ? "z-10 border-slate-900 bg-slate-900 text-white shadow-md dark:border-white dark:bg-white dark:text-[#0b1220] dark:shadow-lg"
                            : "border-slate-300/90 bg-white/80 text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700/80 dark:bg-[#10192b]/60 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors duration-300",
                            isActive
                              ? "text-white dark:text-[#0b1220]"
                              : "text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white",
                          )}
                        />
                        <span className="truncate text-xs font-semibold uppercase tracking-wider sm:text-sm">
                          {equipment.name}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Card Stack */}
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative flex min-h-[480px] flex-1 items-center justify-center overflow-hidden border-t border-slate-200 bg-slate-100/80 px-6 py-12 dark:border-slate-800 dark:bg-[#0f172a] lg:h-full lg:border-l lg:border-t-0 lg:px-10"
            >
              <div className="relative flex aspect-[4/5] w-full max-w-[390px] items-center justify-center">
                {list.map((equipment, index) => {
                  const status = getCardStatus(index, currentIndex, len);
                  const isActive = status === "active";
                  const isPrev = status === "prev";
                  const isNext = status === "next";

                  return (
                    <motion.div
                      key={equipment._id}
                      initial={false}
                      animate={{
                        x: isActive ? 0 : isPrev ? -76 : isNext ? 76 : 0,
                        scale: isActive ? 1 : isPrev || isNext ? 0.86 : 0.72,
                        opacity: isActive ? 1 : isPrev || isNext ? 0.45 : 0,
                        rotate: isPrev ? -3 : isNext ? 3 : 0,
                        zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                        pointerEvents: isActive ? "auto" : "none",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 25,
                        mass: 0.8,
                      }}
                      className="absolute inset-0 origin-center overflow-hidden rounded-[2rem] border-4 border-white bg-slate-100 shadow-2xl dark:border-slate-800 dark:bg-[#0b1220]"
                    >
                      <CardPhoto item={equipment} isActive={isActive} />

                      {/* Availability / Rental Type Pill */}
                      <div
                        className={cn(
                          "absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-slate-900/75 px-3 py-1 backdrop-blur-md transition-opacity duration-300 dark:bg-[#0b1220]/80",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white">
                          {equipment.rentalType}
                        </span>
                      </div>

                      {/* Bottom Overlay Details & Link */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-6 pt-24 text-white dark:from-[#0b1220]/95 dark:via-[#0b1220]/70"
                          >
                            <div className="mb-2.5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-100 backdrop-blur-md">
                              <span>{equipment.category}</span>
                            </div>

                            <h3 className="font-heading text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                              {equipment.name}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-200">
                              <span className="font-semibold text-white">
                                ${equipment.price} / {UNIT[equipment.rentalType]}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-300">
                                <MapPin className="size-3.5" />
                                {equipment.location}
                              </span>
                            </div>

                            <Link
                              href={buildEquipmentUrl(equipment)}
                              className="mt-4 flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 dark:text-[#0b1220]"
                            >
                              View Details
                              <ArrowRight className="size-4" />
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <Link href="/equipment" className="inline-block w-fit">
            <InteractiveHoverButton
              text="View all equipment"
              dotClassName="size-2.5"
              durationClassName="duration-300"
              className="h-12 w-56"
            />
          </Link>
        </motion.div>
      </div>

      <span className="sr-only">
        Showing {activeItem.name} in {activeItem.category}
      </span>
    </section>
  );
}

// Keeps `import { Features }` in app/page.tsx working
export { FeaturedEquipment as Features };