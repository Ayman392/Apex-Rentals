"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CreditCard, PackageCheck, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import StackingCards, {
  StackingCardItem,
} from "@/components/ui/stacking-cards";
import { SectionTitle } from "@/components/ui/section-title";

const HOW_IT_WORKS_STEPS = [
  {
    badge: "Browse & Filter",
    title: "Find the Right Equipment",
    description:
      "Search verified gear by category, location, rental duration, and availability—from heavy machinery and cameras to event sound systems.",
    highlights: ["Category & location filters", "Live unit availability"],
    icon: Search,
    cardClass:
      "bg-primary text-primary-foreground border border-primary-foreground/15 shadow-2xl",
    iconBoxClass: "bg-primary-foreground/15 text-primary-foreground",
    pillClass: "bg-primary-foreground/15 text-primary-foreground",
  },
  {
    badge: "Instant Booking",
    title: "Pick Dates, Duration & Units",
    description:
      "Select your start date, choose daily, weekly, or monthly terms, and adjust unit quantities with transparent real-time pricing.",
    highlights: ["Daily, weekly & monthly rates", "Instant total calculation"],
    icon: CalendarCheck,
    cardClass:
      "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-2xl",
    iconBoxClass: "bg-primary/15 text-primary",
    pillClass:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
  },
  {
    badge: "Secure Checkout",
    title: "Pay Safely with Stripe",
    description:
      "Complete your reservation through protected Stripe checkout with instant booking confirmation and clear rental tracking.",
    highlights: ["Encrypted Stripe session", "Instant booking receipt"],
    icon: CreditCard,
    cardClass:
      "bg-stone-100 dark:bg-slate-900 text-zinc-950 dark:text-zinc-50 border border-stone-200 dark:border-slate-800 shadow-2xl",
    iconBoxClass: "bg-primary/15 text-primary",
    pillClass:
      "bg-white dark:bg-slate-800 text-zinc-800 dark:text-zinc-200",
  },
  {
    badge: "Handover & Return",
    title: "Pick Up, Get to Work & Return",
    description:
      "Coordinate pickup with verified equipment owners, complete your project on schedule, and manage your active rentals from your dashboard.",
    highlights: ["Verified equipment owners", "Live dashboard tracking"],
    icon: PackageCheck,
    cardClass:
      "bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 shadow-2xl",
    iconBoxClass: "bg-primary/20 text-primary",
    pillClass: "bg-white/10 text-white",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="How It Works" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Rent in four simple steps</span>{" "}
            <span className="text-muted-foreground">
              from search to handover.
            </span>
          </p>
        </motion.div>

        {/* Stacking Cards */}
        <div className="mt-8">
          <StackingCards totalCards={HOW_IT_WORKS_STEPS.length}>
            {HOW_IT_WORKS_STEPS.map(
              (
                {
                  badge,
                  cardClass,
                  description,
                  highlights,
                  icon: Icon,
                  iconBoxClass,
                  pillClass,
                  title,
                },
                index,
              ) => (
                <StackingCardItem
                  key={title}
                  index={index}
                  topPosition={`${96 + index * 20}px`}
                  style={{ zIndex: index + 1 }}
                  className="h-[460px] sm:h-[440px]"
                >
                  <div
                    className={cn(
                      cardClass,
                      "mx-auto flex h-[88%] w-full flex-col justify-between gap-5 rounded-3xl px-5 py-6 sm:h-[78%] sm:flex-row sm:items-center sm:gap-10 sm:px-12 sm:py-10",
                    )}
                  >
                    {/* Left: Copy & Highlights */}
                    <div className="flex flex-1 flex-col justify-center">
                      <span
                        className={cn(
                          "mb-2.5 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                          pillClass,
                        )}
                      >
                        {badge}
                      </span>
                      <h3 className="font-heading mb-2 text-xl font-bold tracking-tight sm:mb-3 sm:text-3xl">
                        {title}
                      </h3>
                      <p className="max-w-xl text-sm leading-relaxed opacity-85 sm:text-base">
                        {description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {highlights.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium leading-none",
                              pillClass,
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Minimal Icon Visual */}
                    <div
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-2xl sm:size-28 sm:rounded-3xl",
                        iconBoxClass,
                      )}
                    >
                      <Icon className="size-7 sm:size-12" strokeWidth={1.75} />
                    </div>
                  </div>
                </StackingCardItem>
              ),
            )}
          </StackingCards>
        </div>
      </div>
    </section>
  );
}