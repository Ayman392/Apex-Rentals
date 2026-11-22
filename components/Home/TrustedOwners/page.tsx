"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/ui/section-title";
import { TeamShowcase } from "@/components/ui/team-showcase";

export function TrustedOwners() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 mt-20 border-b border-border pb-8 md:flex-row md:items-end md:justify-between"
        >
          <SectionTitle text="Trusted Owners" />
          <p className="max-w-xs text-lg font-medium leading-snug tracking-tight md:text-right">
            <span className="text-foreground">Verified fleet partners</span>{" "}
            <span className="text-muted-foreground">
              powering projects near you.
            </span>
          </p>
        </motion.div>

        <div className="mt-8">
          <TeamShowcase />
        </div>
      </div>
    </section>
  );
}

export default TrustedOwners;