"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type BaseProps = {
  children: ReactNode;
  className?: string;
};

/** Fades + slides a single block in once when it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: BaseProps & { delay?: number; y?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Parent for a group of <StaggerItem/> children (cards, steps, etc.). */
export function Stagger({
  children,
  className,
  stagger = 0.08,
}: BaseProps & { stagger?: number }) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: BaseProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: EASE },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}