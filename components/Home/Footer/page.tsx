"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Mail, Phone } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "Home", href: "/" },
  { label: "All Equipment", href: "/equipment" },
  { label: "How It Works", href: "/#how-it-works" },
];

const CATEGORY_LINKS = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
].map((name) => ({
  label: name,
  href: `/equipment?category=${encodeURIComponent(name)}`,
}));

const ACCOUNT_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Contact Us", href: "mailto:support@apexrentals.com" },
];

// New X logo (not the old Twitter bird)
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const socialButton =
  "flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/60 hover:text-coral-text";

type FooterLink = { label: string; href: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h3 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  const handleBackToTop = () => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  };

  return (
    <footer id="contact" className="px-4 pb-6 pt-24">
      <div className="glass mx-auto max-w-6xl overflow-hidden rounded-3xl">
        {/* Top: brand + link columns */}
        <div className="grid gap-10 px-6 pt-12 sm:px-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Apex Rentals logo"
                width={36}
                height={36}
                className="size-9 rounded-[0.65rem] ring-1 ring-border"
              />
              <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
                Apex Rentals
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The simple way to rent professional equipment from verified
              owners, with flexible periods and secure payments.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apex Rentals on X"
                className={socialButton}
              >
                <XIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Apex Rentals on Facebook"
                className={socialButton}
              >
                <FacebookIcon />
              </a>
              <a
                href="mailto:support@apexrentals.com"
                aria-label="Email Apex Rentals"
                className={socialButton}
              >
                <Mail className="size-4" />
              </a>
            </div>
          </div>

          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Categories" links={CATEGORY_LINKS} />
          <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        </div>

        {/* Big outlined brand name, cut off by the divider line */}
        <div aria-hidden="true" className="mt-10 select-none px-4 sm:px-10">
          <svg
            viewBox="0 0 1000 75"
            className="block h-auto w-full text-foreground"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="wordmark-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0.1" stopColor="white" stopOpacity="1" />
                <stop offset="0.95" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask
                id="wordmark-mask"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1000"
                height="75"
              >
                <rect width="1000" height="75" fill="url(#wordmark-fade)" />
              </mask>
            </defs>
            <g mask="url(#wordmark-mask)">
              <text
                x="500"
                y="100"
                textAnchor="middle"
                textLength="990"
                lengthAdjust="spacing"
                fontSize="112"
                fontWeight="600"
                fill="none"
                stroke="currentColor"
                strokeOpacity={0.35}
                strokeWidth="0.8"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                APEX RENTALS
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-6 py-5 text-xs text-muted-foreground sm:flex-row sm:px-10">
          <p>© {year} Apex Rentals. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <a
              href="mailto:support@apexrentals.com"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="size-3.5 text-coral-text" />
              support@apexrentals.com
            </a>
            <a
              href="tel:+88018555588855"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Phone className="size-3.5 text-coral-text" />
              +(880) 18555-88855
            </a>

            <button
              type="button"
              onClick={handleBackToTop}
              aria-label="Back to top"
              className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/60 hover:bg-primary hover:text-primary-foreground"
            >
              <span>Back to top</span>
              <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}