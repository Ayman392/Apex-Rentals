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
import { buildEquipmentUrl } from "@/lib/slug";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { SectionTitle } from "@/components/ui/section-title";
import { cn } from "@/lib/utils";
import Image from "next/image";

const UNIT = { Daily: "day", Weekly: "week", Monthly: "month" } as const;
const AUTO_PLAY_INTERVAL = 3400;
const ITEM_HEIGHT = 64;

const USE_DEMO_IMAGES = false;
const DEMO_IMAGE_COUNT = 8; // public/demo/1.jpg ... 8.jpg

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
  index,
  isActive,
}: {
  item: Equipment;
  index: number;
  isActive: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const fallbackSrc = `/demo/${(index % DEMO_IMAGE_COUNT) + 1}.jpg`;
  const src = USE_DEMO_IMAGES || failed || !item.image ? fallbackSrc : item.image;

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
  const list = items.slice(0, 6);
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

  if (len === 0) return null;

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
          <SectionTitle text="Features" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Equipment ready to rent</span>{" "}
            <span className="text-muted-foreground">
              from verified owners near you.
            </span>
          </p>
        </motion.div>

        {/* Split Feature Carousel (Light & Dark Mode) */}
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl lg:rounded-[3rem]">
          <div className="flex min-h-[560px] flex-col lg:h-[580px] lg:flex-row">
            {/* Left Rail */}
            <div className="relative z-30 flex min-h-[320px] w-full flex-col items-start justify-center overflow-hidden bg-primary px-6 text-primary-foreground sm:px-10 lg:h-full lg:w-[42%] lg:px-12">
              <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-14 bg-gradient-to-b from-primary via-primary/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-14 bg-gradient-to-t from-primary via-primary/80 to-transparent" />

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
                          0.25,
                          1 - Math.abs(wrappedDistance) * 0.25,
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
                            ? "z-10 border-background bg-background text-primary shadow-lg"
                            : "border-primary-foreground/25 bg-transparent text-primary-foreground/70 hover:border-primary-foreground/50 hover:text-primary-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors duration-300",
                            isActive
                              ? "text-primary"
                              : "text-primary-foreground/60 group-hover:text-primary-foreground",
                          )}
                        />
                        <span className="truncate text-xs font-medium uppercase tracking-wider sm:text-sm">
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
              className="relative flex min-h-[480px] flex-1 items-center justify-center overflow-hidden border-t border-border bg-muted/40 px-6 py-12 dark:bg-muted/20 lg:h-full lg:border-l lg:border-t-0 lg:px-10"
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
                      className="absolute inset-0 origin-center overflow-hidden rounded-[2rem] border-4 border-background bg-card shadow-2xl"
                    >
                      <CardPhoto
                        item={equipment}
                        index={index}
                        isActive={isActive}
                      />

                      {/* Availability / Rental Type Pill */}
                      <div
                        className={cn(
                          "absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 backdrop-blur-md transition-opacity duration-300",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/90">
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
                            className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/55 to-transparent p-6 pt-24 text-white"
                          >
                            <div className="mb-2.5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-md">
                              <span>{equipment.category}</span>
                            </div>

                            <h3 className="font-heading text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
                              {equipment.name}
                            </h3>

                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-sm text-white/80">
                              <span className="font-semibold text-white">
                                ${equipment.price} / {UNIT[equipment.rentalType]}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs text-white/75">
                                <MapPin className="size-3.5" />
                                {equipment.location}
                              </span>
                            </div>

                            <Link
                              href={buildEquipmentUrl(equipment)}
                              className="mt-4 flex items-center justify-between rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
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