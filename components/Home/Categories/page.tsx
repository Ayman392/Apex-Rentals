"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Transition,
} from "framer-motion";
import {
  ArrowUpRight,
  Camera,
  HardHat,
  Laptop,
  Layers,
  LayoutGrid,
  List,
  PartyPopper,
  Tractor,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/section-title";

/* ---------- Data ---------- */

// `name` must match the category values stored in MongoDB exactly,
// because it is sent to the All Equipment page as a filter.
type Category = {
  name: string;
  tagline: string;
  icon: LucideIcon;
  wash: string;
};

const CATEGORIES: Category[] = [
  {
    name: "Construction Equipment",
    tagline: "Excavators, loaders, tools",
    icon: HardHat,
    wash: "#7a4a22",
  },
  {
    name: "Photography Equipment",
    tagline: "Cameras, drones, lighting",
    icon: Camera,
    wash: "#2a3a73",
  },
  {
    name: "Vehicles & Transportation",
    tagline: "Vans, pickups, trucks",
    icon: Truck,
    wash: "#2f4a7a",
  },
  {
    name: "Agriculture Equipment",
    tagline: "Tractors, harvesters, sprayers",
    icon: Tractor,
    wash: "#2d6b4a",
  },
  {
    name: "Electronics",
    tagline: "Laptops, projectors, displays",
    icon: Laptop,
    wash: "#1f6b73",
  },
  {
    name: "Event Equipment",
    tagline: "Sound, lighting, tents",
    icon: PartyPopper,
    wash: "#7a2f66",
  },
];

type ViewMode = "list" | "card" | "pack";

const VIEWS: { id: ViewMode; label: string; icon: LucideIcon }[] = [
  { id: "list", label: "List", icon: List },
  { id: "card", label: "Cards", icon: LayoutGrid },
  { id: "pack", label: "Stack", icon: Layers },
];

/* ---------- Motion ---------- */

const snappySpring: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

const fastFade: Transition = { duration: 0.1, ease: "linear" };

/* ---------- Tile (photo, or icon on a tinted gradient) ---------- */

function Tile({ category, image }: { category: Category; image?: string }) {
  const [failed, setFailed] = useState(false);
  const Icon = category.icon;

  if (image && !failed) {
    return (
      <motion.img
        layout
        transition={snappySpring}
        src={image}
        alt={category.name}
        onError={() => setFailed(true)}
        className="block h-full w-full object-cover"
      />
    );
  }

  return (
    <motion.div
      layout
      transition={snappySpring}
      style={{
        backgroundImage: `linear-gradient(155deg, ${category.wash}, #141b2d 85%)`,
      }}
      className="grid h-full w-full place-items-center"
    >
      <Icon aria-hidden strokeWidth={1.5} className="size-1/2 text-white/90" />
    </motion.div>
  );
}

/* ---------- View switcher tab ---------- */

function Tab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label} view`}
      className={cn(
        "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active && (
        <motion.span
          layoutId="category-view-tab"
          transition={snappySpring}
          className="absolute inset-0 rounded-full bg-primary shadow-md"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        <Icon className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </span>
    </button>
  );
}

/* ---------- Section ---------- */

// `images` is optional: map a category name to a photo URL.
// Without it, each tile shows its icon on a tinted gradient.
export function Categories({
  images = {},
}: {
  images?: Record<string, string>;
}) {
  const [view, setView] = useState<ViewMode>("card");
  const mid = (CATEGORIES.length - 1) / 2;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        {/* Header: same style as the Featured section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="Categories" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Browse by equipment type</span>{" "}
            <span className="text-muted-foreground">
              and find exactly what your project needs.
            </span>
          </p>
        </motion.div>

        {/* Layout switcher */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          role="group"
          aria-label="Change category layout"
          className="glass-chip mt-8 flex w-fit rounded-full p-1"
        >
          {VIEWS.map((v) => (
            <Tab
              key={v.id}
              active={view === v.id}
              onClick={() => setView(v.id)}
              icon={v.icon}
              label={v.label}
            />
          ))}
        </motion.div>

        {/* Items */}
        <div className="relative mt-8 min-h-[18rem]">
          <LayoutGroup>
            <motion.div
              layout
              transition={snappySpring}
              className={cn(
                "relative w-full",
                view === "list" && "flex flex-col gap-4",
                view === "card" &&
                  "grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3",
                view === "pack" && "flex h-72 items-center justify-center",
              )}
            >
              {CATEGORIES.map((category, index) => {
                const offset = index - mid;
                const href = `/equipment?category=${encodeURIComponent(category.name)}`;

                return (
                  <motion.div
                    key={category.name}
                    layout
                    transition={snappySpring}
                    className={cn(
                      "relative flex items-center",
                      view === "list" && "w-full flex-row gap-4",
                      view === "card" && "w-full flex-col items-start gap-3",
                      view === "pack" &&
                        "absolute h-40 w-40 justify-center",
                    )}
                    style={{
                      zIndex:
                        view === "pack"
                          ? 10 - Math.round(Math.abs(offset) * 2)
                          : 1,
                    }}
                    animate={
                      view === "pack"
                        ? {
                            rotate: offset * 6,
                            x: offset * 30,
                            y: Math.abs(offset) * 6,
                          }
                        : { rotate: 0, x: 0, y: 0 }
                    }
                  >
                    {/* Tile */}
                    <motion.div
                      layout
                      transition={snappySpring}
                      className={cn(
                        "relative shrink-0 overflow-hidden bg-background",
                        view === "list" &&
                          "h-16 w-16 rounded-2xl border border-border/50",
                        view === "card" &&
                          "aspect-[4/3] w-full rounded-[1.8rem] border border-border/50 shadow-sm",
                        view === "pack" &&
                          "h-full w-full rounded-[2rem] border border-border/50 shadow-xl",
                      )}
                    >
                      <Tile category={category} image={images[category.name]} />
                    </motion.div>

                    {/* Name, tagline and orange arrow (hidden in stack view) */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {view !== "pack" && (
                        <motion.div
                          key={`${category.name}-info`}
                          layout
                          initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
                          transition={fastFade}
                          className={cn(
                            "flex min-w-0 flex-1 items-center justify-between gap-2",
                            view === "card" ? "w-full px-1" : "px-0",
                          )}
                        >
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <h3
                              className={cn(
                                "font-heading text-base font-semibold leading-tight text-foreground",
                                view === "card" ? "line-clamp-2" : "truncate",
                              )}
                            >
                              {category.name}
                            </h3>
                            <p className="truncate text-xs font-medium text-muted-foreground">
                              {category.tagline}
                            </p>
                          </div>

                          <Link
                            href={href}
                            aria-label={`Browse ${category.name}`}
                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgb(255_90_78/0.6)] transition-colors duration-300 hover:bg-primary/90"
                          >
                            <ArrowUpRight className="size-4" />
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {view === "list" && (
                      <div className="absolute -bottom-2 left-20 right-0 h-px bg-border/40" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stack view: one orange button for all equipment */}
            <AnimatePresence>
              {view === "pack" && (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 5, filter: "blur(5px)" }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="relative z-0 mt-6 flex justify-center"
                >
                  <Link
                    href="/equipment"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground shadow-[0_10px_30px_-10px_rgb(255_90_78/0.55)] transition duration-300 hover:bg-primary/90"
                  >
                    Browse all equipment
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    </section>
  );
}
