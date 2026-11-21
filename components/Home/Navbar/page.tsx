"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";

const spring: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 12,
  stiffness: 110,
};

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
].map((name) => ({
  name,
  href: `/equipment?category=${encodeURIComponent(name)}`,
}));

function Brand() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
    >
      <Image
        src="/logo.png"
        alt="Apex Rentals logo"
        width={36}
        height={36}
        priority
        className="size-9 rounded-[0.65rem] ring-1 ring-border shadow-lg shadow-black/20"
      />
      <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
        Apex Rentals
      </span>
    </Link>
  );
}

function UserAvatar({
  src,
  name,
}: {
  src?: string | null;
  name?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <User className="size-4" />;
  }

  return (
    <Image
      src={src}
      alt={name || "User"}
      width={32}
      height={32}
      unoptimized
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="size-full object-cover"
    />
  );
}

function HoverPill() {
  return (
    <motion.span
      layoutId="nav-hover-pill"
      className="absolute inset-0 rounded-full bg-foreground/10 ring-1 ring-border"
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
    />
  );
}

function navItemClass(active: boolean) {
  return cn(
    "relative block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition active:scale-95 xl:px-4",
    active
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground",
  );
}

type NavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  hovered: string | null;
  onHover: (name: string | null) => void;
};

function NavLink({ href, label, active, hovered, onHover }: NavLinkProps) {
  return (
    <div className="relative" onMouseEnter={() => onHover(label)}>
      {hovered === label && <HoverPill />}
      <Link href={href} className={navItemClass(active)}>
        {label}
      </Link>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await signOut();
    setLoggingOut(false);

    if (error) {
      toast.error(error.message || "Failed to log out.");
      return;
    }

    toast.success("Logged out successfully.");
    setAccountOpen(false);
    closeMobile();
    router.push("/");
    router.refresh();
  }

  if (pathname.startsWith("/dashboard")) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="glass-strong w-full max-w-6xl rounded-2xl">
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <Brand />

          {/* Desktop links */}
          <div
            className="hidden items-center gap-1 lg:flex"
            onMouseLeave={() => setHovered(null)}
          >
            <NavLink
              href="/"
              label="Home"
              active={pathname === "/"}
              hovered={hovered}
              onHover={setHovered}
            />
            <NavLink
              href="/equipment"
              label="All Equipment"
              active={pathname.startsWith("/equipment")}
              hovered={hovered}
              onHover={setHovered}
            />

            {/* Categories hover menu */}
            <div
              className="relative"
              onMouseEnter={() => {
                setHovered("Categories");
                setCategoriesOpen(true);
              }}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              {hovered === "Categories" && <HoverPill />}
              <button
                type="button"
                aria-expanded={categoriesOpen}
                onClick={() => setCategoriesOpen((v) => !v)}
                className={cn(navItemClass(false), "flex items-center gap-1")}
              >
                Categories
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    categoriesOpen && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-7">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 6 }}
                      transition={spring}
                      className="glass-strong w-[26rem] rounded-2xl p-4"
                    >
                      <p className="mb-3 px-2 text-xs font-medium text-coral-text">
                        Browse by category
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {CATEGORIES.map((c) => (
                          <Link
                            key={c.name}
                            href={c.href}
                            onClick={() => setCategoriesOpen(false)}
                            className="rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              href="/#how-it-works"
              label="How It Works"
              active={false}
              hovered={hovered}
              onHover={setHovered}
            />
            <NavLink
              href="/#contact"
              label="Contact Us"
              active={false}
              hovered={hovered}
              onHover={setHovered}
            />
          </div>

          {/* Desktop actions */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <ThemeToggle />
            {isPending ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <div
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  type="button"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 text-sm font-medium text-foreground transition hover:bg-foreground/10"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-1 ring-border">
                    <UserAvatar
                      key={user.image}
                      src={user.image}
                      name={user.name}
                    />
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted-foreground transition-transform",
                      accountOpen && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <div className="absolute right-0 top-full pt-7">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 6 }}
                        transition={spring}
                        className="glass-strong w-60 rounded-2xl p-3"
                      >
                        <div className="mb-2 border-b border-border px-2.5 pb-2.5">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs font-medium text-coral-text">
                            {user.role || "Customer"}
                          </p>
                        </div>

                        <div className="flex flex-col gap-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                          >
                            <LayoutDashboard className="size-4" />
                            Dashboard
                          </Link>

                          <Link
                            href="/dashboard/profile"
                            onClick={() => setAccountOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                          >
                            <User className="size-4" />
                            Profile
                          </Link>

                          <button
                            type="button"
                            disabled={loggingOut}
                            onClick={handleLogout}
                            className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-border px-2.5 pt-2.5 pb-2 text-left text-sm text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground disabled:opacity-50"
                          >
                            <LogOut className="size-4" />
                            {loggingOut ? "Logging out..." : "Logout"}
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-foreground/10 lg:hidden"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Mobile panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden lg:hidden"
            >
              <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto border-t border-border px-4 py-4 sm:px-6">
                <Link
                  href="/"
                  onClick={closeMobile}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-foreground/10"
                >
                  Home
                </Link>
                <Link
                  href="/equipment"
                  onClick={closeMobile}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-foreground/10"
                >
                  All Equipment
                </Link>

                <p className="mt-2 px-3 text-xs font-medium text-coral-text">
                  Categories
                </p>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    onClick={closeMobile}
                    className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                ))}

                <Link
                  href="/#how-it-works"
                  onClick={closeMobile}
                  className="mt-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-foreground/10"
                >
                  How It Works
                </Link>
                <Link
                  href="/#contact"
                  onClick={closeMobile}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-foreground/10"
                >
                  Contact Us
                </Link>

                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between px-1 pb-1 text-sm text-muted-foreground">
                    Theme
                    <ThemeToggle />
                  </div>
                  {isPending ? (
                    <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-2.5 px-1 pb-1">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-1 ring-border">
                          <UserAvatar
                            key={user.image}
                            src={user.image}
                            name={user.name}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.role || "Customer"}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={closeMobile}
                        className={buttonVariants({ variant: "ghost" })}
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        disabled={loggingOut}
                        className={buttonVariants({ variant: "outline" })}
                        onClick={handleLogout}
                      >
                        <LogOut className="size-4" />
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMobile}
                        className={buttonVariants({ variant: "outline" })}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={closeMobile}
                        className={buttonVariants({ variant: "default" })}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </div>
  );
}