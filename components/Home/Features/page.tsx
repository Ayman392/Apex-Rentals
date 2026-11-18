"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Equipment } from "@/lib/equipment";

const UNIT = { Daily: "day", Weekly: "week", Monthly: "month" } as const;

/* ---------- Palette (sampled from the hero) ---------- */

// Card tints, matching the hero's category cards.
const TINTS = {
  navy: { from: "#1c2640", to: "#0b1120" },
  brown: { from: "#432815", to: "#150b06" },
  plum: { from: "#3d1633", to: "#14070f" },
  teal: { from: "#0f3d42", to: "#061618" },
  green: { from: "#12392a", to: "#07150e" },
};

function tintFor(category: string) {
  const c = category.toLowerCase();
  if (c.includes("construction") || c.includes("event gear")) return TINTS.brown;
  if (c.includes("agri")) return TINTS.green;
  if (c.includes("event") || c.includes("sound")) return TINTS.plum;
  if (c.includes("drone")) return TINTS.teal;
  return TINTS.navy; // photography, vehicles, electronics, default
}

/* ---------- Demo images ---------- */

// Set to false once your real equipment images are working.
const USE_DEMO_IMAGES = true;
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

  const span = wide
    ? "lg:col-span-6"
    : total === 5
      ? "lg:col-span-4"
      : "lg:col-span-3";

  const corners = [
    index === 0 && "lg:rounded-tl-[2rem]",
    index === 1 && "lg:rounded-tr-[2rem]",
    index === 2 && "lg:rounded-bl-[2rem]",
    index === total - 1 && "lg:rounded-br-[2rem]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div variants={entrance} className={span}>
      <motion.article
          initial="idle"
          whileHover="active"
          variants={{ idle: {}, active: {} }}
          style={{
            backgroundImage: `linear-gradient(160deg, ${tint.from}, ${tint.to})`,
          }}
          className={`group relative isolate overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.7)] transition-shadow duration-500 hover:shadow-[0_28px_60px_-18px_rgb(0_0_0/0.85)] lg:rounded-md ${corners} ${
            wide ? "h-[22rem] lg:h-[24rem]" : "h-[22rem] lg:h-[17rem]"
          }`}
        >
          {/* Photo fills the card */}
          <motion.div
            className="absolute inset-0"
            variants={{ idle: { scale: 1 }, active: { scale: 1.05 } }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Image
              src={imageFor(item, index)}
              alt={item.name}
              fill
              sizes={
                wide
                  ? "(min-width: 1024px) 540px, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
              }
              className="object-cover"
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.07] to-transparent" />

          {/* Frosted glass panel, tinted with the card's color */}
          <div
            style={{
              backgroundImage: `linear-gradient(to bottom, rgb(255 255 255 / 0.10), ${tint.to}cc)`,
            }}
            className="absolute inset-x-0 bottom-0 z-10 border-t border-white/20 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.22)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6"
          >
            <p className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-white/70">
              {item.category}
            </p>
            <h3
              className={`mt-1.5 truncate font-heading font-medium tracking-tight text-white ${
                wide ? "text-xl" : "text-base"
              }`}
            >
              {item.name}
            </h3>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="flex min-w-0 gap-1 text-xs text-white/80">
                <span className="shrink-0">
                  ${item.price} / {UNIT[item.rentalType]}
                </span>
                <span className="truncate text-white/55">
                  · {item.location}
                </span>
              </p>

              {/* Glass button, turns orange on hover */}
              <Link
                href={`/equipment/${item._id}`}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-md transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                View Details
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
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
          <h2 className="font-heading text-6xl font-semibold tracking-tighter text-foreground sm:text-8xl">
            Featured
          </h2>
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
          className="mt-10 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12"
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
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-10px_rgb(255_107_26/0.55)] transition duration-300 hover:bg-foreground hover:text-background hover:shadow-[0_10px_30px_-10px_rgb(0_0_0/0.6)]"
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