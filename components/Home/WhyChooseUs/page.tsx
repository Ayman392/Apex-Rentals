"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionTitle } from "@/components/ui/section-title"
import Image from "next/image"

interface Feature {
  step: string
  title?: string
  content: string
  image: string
}

interface FeatureStepsProps {
  features?: Feature[]
  className?: string
  title?: string
  autoPlayInterval?: number
  imageHeight?: string
}

const defaultFeatures: Feature[] = [
  {
    step: "Step 1",
    title: "Verified Owners",
    content:
      "Every listing is reviewed and approved before it appears on Apex Rentals.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
  },
  {
    step: "Step 2",
    title: "Flexible Rental Periods",
    content: "Rent by the day, week or month, whatever the job needs.",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80",
  },
  {
    step: "Step 3",
    title: "Secure Payments",
    content: "Pay online with Stripe and get your booking confirmed right away.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80",
  },
]

export function FeatureSteps({
  features = defaultFeatures,
  className,
  title = "Why Choose Us",
  autoPlayInterval = 3500,
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [progress, features.length, autoPlayInterval])

  const handleSelectStep = (index: number) => {
    setCurrentFeature(index)
    setProgress(0)
  }

  return (
    <section id="why-choose-us" className={cn("w-full py-10", className)}>
      <div className="mx-auto w-full max-w-6xl px-6 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text={title} />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Built for reliable rentals</span>{" "}
            <span className="text-muted-foreground">
              from verified owners to instant checkout.
            </span>
          </p>
        </motion.div>

        {/* Steps & Photo Stage */}
        <div className="mt-10 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Left: Interactive Steps */}
          <div className="order-2 space-y-6 md:order-1">
            {features.map((feature, index) => {
              const isActive = index === currentFeature

              return (
                <motion.button
                  key={feature.step}
                  type="button"
                  onClick={() => handleSelectStep(index)}
                  className="flex w-full cursor-pointer items-start gap-5 rounded-2xl p-3 text-left transition-colors hover:bg-muted/30"
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: isActive ? 1 : 0.4 }}
                  transition={{ duration: 0.35 }}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 md:size-10",
                      isActive
                        ? "scale-105 border-primary bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgb(255_90_78/0.65)]"
                        : "border-muted-foreground/40 bg-muted/50 text-muted-foreground",
                    )}
                  >
                    <Check className="size-4 stroke-[2.5]" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground md:text-2xl">
                      {feature.title || feature.step}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {feature.content}
                    </p>

                    {/* Active step progress bar */}
                    {isActive && (
                      <div className="pt-2">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-border/60">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Right: Real Photo Frame */}
          <div className="relative order-1 h-[240px] overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-2xl sm:h-[320px] md:order-2 lg:h-[400px]">
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={feature.step}
                      className="absolute inset-0 overflow-hidden"
                      initial={{ y: 40, opacity: 0, scale: 1.03 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: -40, opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <Image 
                        width={900}
                        height={900}
                        src={feature.image}
                        alt={feature.title || feature.step}
                        className="h-full w-full object-cover object-center"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent"
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                          {feature.step} · {feature.title}
                        </span>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FeatureSteps as WhyChooseUs }