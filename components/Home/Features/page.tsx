"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Equipment } from "@/lib/equipment";
import { SectionTitle } from "@/components/ui/section-title";

const UNIT = { Daily: "day", Weekly: "week", Monthly: "month" } as const;

/* ---------- Palette ---------- */

// `wash` is the colour that rises from the bottom of each photo.
const TINTS = {
  navy: { wash: "#33407a" },
  brown: { wash: "#7a4a22" },
  plum: { wash: "#7a2f66" },
  teal: { wash: "#1f6b73" },
  green: { wash: "#2d6b4a" },
};

function tintFor(category: string) {
  const c = category.toLowerCase();
  if (c.includes("construction")) return TINTS.brown;
  if (c.includes("agri")) return TINTS.green;
  if (c.includes("event") || c.includes("sound")) return TINTS.plum;
  if (c.includes("electronic") || c.includes("drone")) return TINTS.teal;
  return TINTS.navy; // photography, vehicles, default
}

/* ---------- Images ---------- */

// Real photos come from item.image (Unsplash). The demo image is only a
// fallback for items that have no image yet. Set USE_DEMO_IMAGES to true
// to force the demo images for every card.
const USE_DEMO_IMAGES = false;
const DEMO_IMAGE_COUNT = 8; // public/demo/1.jpg ... 8.jpg

function imageFor(item: Equipment, index: number) {
  if (USE_DEMO_IMAGES || !item.image) {
    return `/demo/${(index % DEMO_IMAGE_COUNT) + 1}.jpg`;
  }
  return item.image;
}

/* ---------- Motion ---------- */

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const entrance = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ---------- Card ---------- */

function GlassCard({
  item,
  index,
  total,
}: {
  item: Equipment;
  index: number;
  total: number;
}) {
  const wide = index < 2;
  const tint = tintFor(item.category);
  // If the photo fails to load, fall back to a demo image instead of a broken icon
  const [failed, setFailed] = useState(false);
  const src = failed
    ? `/demo/${(index % DEMO_IMAGE_COUNT) + 1}.jpg`
    : imageFor(item, index);

  const span = wide
    ? "lg:col-span-6"
    : total === 5
      ? "lg:col-span-4"
      : "lg:col-span-3";

  return (
    <motion.div variants={entrance} className={`relative hover:z-20 ${span}`}>
      <motion.article
        initial="idle"
        whileHover="active"
        variants={{ idle: { scale: 1 }, active: { scale: 1.04 } }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={`group relative isolate overflow-hidden rounded-3xl bg-neutral-900 ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.7)] transition-shadow duration-500 hover:shadow-[0_28px_60px_-18px_rgb(0_0_0/0.85)] ${
          wide ? "h-[22rem] lg:h-[24rem]" : "h-[22rem] lg:h-[17rem]"
        }`}
      >
        {/* Photo fills the card */}
        <motion.div
          className="absolute inset-0"
          variants={{ idle: { scale: 1 }, active: { scale: 1.03 } }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Image
            src={src}
            alt={item.name}
            onError={() => setFailed(true)}
            fill
            sizes={
              wide
                ? "(min-width: 1024px) 540px, (min-width: 640px) 50vw, 100vw"
                : "(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
            }
            className="object-cover"
          />
        </motion.div>

        {/* Coloured wash rising from the bottom */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to top, ${tint.wash}f2 0%, ${tint.wash}cc 32%, ${tint.wash}40 58%, transparent 80%)`,
          }}
        />

        {/* Category chip */}
        <span className="absolute left-4 top-4 z-10 max-w-[75%] truncate rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur-md">
          {item.category}
        </span>

        {/* Text and glass button */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
          <h3
            className={`truncate font-heading font-semibold tracking-tight text-white ${
              wide ? "text-2xl" : "text-xl"
            }`}
          >
            {item.name}
          </h3>
          <p className="mt-1 truncate text-sm text-white/75">
            ${item.price} / {UNIT[item.rentalType]} · {item.location}
          </p>

          <Link
            href={`/equipment/${item._id}`}
            className="mt-3 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-8px_rgb(255_107_26/0.6)] transition-colors duration-300 hover:bg-primary/90"
          >
            View Details
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.article>
    </motion.div>
  );
}

/* ---------- Section ---------- */

export function FeaturedEquipment({ items }: { items: Equipment[] }) {
  const list = items.slice(0, 6);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        {/* Header: big title left, two-tone subtitle right, hairline below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-white/15 pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="Featured" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Equipment ready to rent</span>{" "}
            <span className="text-muted-foreground">
              from verified owners near you.
            </span>
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12"
        >
          {list.map((equipment, i) => (
            <GlassCard
              key={equipment._id}
              item={equipment}
              index={i}
              total={list.length}
            />
          ))}
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/equipment"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-10px_rgb(255_107_26/0.55)] transition duration-300 hover:bg-primary/90"
          >
            View all equipment
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Keeps `import { Features }` in app/page.tsx working
export { FeaturedEquipment as Features };