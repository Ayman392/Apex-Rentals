"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  layoutId: string;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useAnimatedSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error(
      "useAnimatedSidebar must be used inside AnimatedSidebarProvider.",
    );
  }
  return ctx;
}

export function AnimatedSidebarProvider({
  children,
  defaultOpen = true,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const layoutId = useId();

  const toggleSidebar = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setOpenMobile((prev) => !prev);
    } else {
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        layoutId: `${layoutId}-active`,
      }}
    >
      <div
        {...props}
        data-state={open ? "expanded" : "collapsed"}
        className={cn("flex min-h-svh w-full min-w-0", className)}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function AnimatedSidebar({
  children,
  ariaLabel = "Sidebar",
  panelClassName,
  className,
}: {
  children?: ReactNode;
  ariaLabel?: string;
  collapsible?: "icon" | "offcanvas" | "none";
  variant?: "sidebar" | "floating" | "inset";
  panelClassName?: string;
  className?: string;
}) {
  const { open, openMobile, setOpenMobile } = useAnimatedSidebar();
  const collapsed = !open;

  return (
    <>
      {/* Desktop collapsible sidebar */}
      <motion.aside
        aria-label={ariaLabel}
        data-state={collapsed ? "collapsed" : "expanded"}
        initial={false}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ type: "spring", stiffness: 380, damping: 35, mass: 0.75 }}
        className={cn(
          "group/sidebar relative hidden shrink-0 md:block",
          className,
        )}
      >
        <div
          className={cn(
            "sticky top-2 m-2 flex h-[calc(100svh-1rem)] flex-col overflow-hidden rounded-2xl bg-background",
            panelClassName,
          )}
        >
          {children}
        </div>
      </motion.aside>

      {/* Mobile slide-out drawer */}
      <AnimatePresence>
        {openMobile && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.button
              type="button"
              aria-label="Close sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpenMobile(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.aside
              aria-label={ariaLabel}
              data-state="expanded"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className={cn(
                "group/sidebar fixed inset-y-0 left-0 z-10 flex w-72 max-w-[85vw] flex-col overflow-hidden border-r border-border bg-background shadow-2xl",
                panelClassName,
              )}
            >
              {children}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export function AnimatedSidebarTrigger({
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useAnimatedSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) toggleSidebar();
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarClose({
  className,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpenMobile } = useAnimatedSidebar();
  return (
    <button
      type="button"
      aria-label="Close sidebar"
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpenMobile(false);
      }}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarRail() {
  const { toggleSidebar } = useAnimatedSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      className="absolute inset-y-0 left-full z-20 hidden w-3 -translate-x-1/2 cursor-ew-resize md:block"
    />
  );
}

export function AnimatedSidebarInset({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "relative flex min-h-svh min-w-0 flex-1 flex-col bg-background md:m-2 md:ml-0 md:rounded-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex shrink-0 flex-col gap-2 p-3", className)}
      {...props}
    />
  );
}

export function AnimatedSidebarContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 py-2",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-2 border-t border-border p-3",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarGroup({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col px-1 py-1.5 group-data-[state=collapsed]/sidebar:px-0",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarGroupLabel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-1 h-6 truncate px-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-all group-data-[state=collapsed]/sidebar:mb-0 group-data-[state=collapsed]/sidebar:h-0 group-data-[state=collapsed]/sidebar:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function AnimatedSidebarGroupContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full min-w-0", className)} {...props} />;
}

export function AnimatedSidebarMenu({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul
      className={cn("flex w-full min-w-0 list-none flex-col gap-1", className)}
      {...props}
    />
  );
}

export function AnimatedSidebarMenuItem({
  className,
  ...props
}: HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("relative", className)} {...props} />;
}

export function AnimatedSidebarMenuButton({
  children,
  icon,
  isActive = false,
  disabled = false,
  onSelect,
  className,
}: {
  children: ReactNode;
  icon?: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const { layoutId, setOpenMobile } = useAnimatedSidebar();
  const label = typeof children === "string" ? children : undefined;

  return (
    <button
      type="button"
      disabled={disabled}
      title={label}
      onClick={() => {
        if (disabled) return;
        onSelect?.();
        setOpenMobile(false);
      }}
      className={cn(
        "relative flex h-10 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl px-2.5 text-left text-sm font-medium outline-none transition-colors",
        "group-data-[state=collapsed]/sidebar:mx-auto group-data-[state=collapsed]/sidebar:size-10 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0",
        "text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "text-foreground",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-xl bg-muted"
        />
      )}
      {icon && (
        <span className="relative z-10 grid size-5 shrink-0 place-items-center">
          {icon}
        </span>
      )}
      <span className="relative z-10 min-w-0 flex-1 truncate group-data-[state=collapsed]/sidebar:hidden">
        {children}
      </span>
    </button>
  );
}