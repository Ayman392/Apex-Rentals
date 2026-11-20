"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Compass,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  Package,
  PackagePlus,
  PanelLeft,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/ui/animated-sidebar";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut, useSession } from "@/lib/auth-client";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getRoleNavItems(role?: string | null): NavItem[] {
  const normalized = (role || "customer").toLowerCase();

  if (normalized === "admin") {
    return [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
      { label: "All Users", href: "/dashboard/all-users", icon: Users },
      {
        label: "Manage Equipment",
        href: "/dashboard/all-equipment",
        icon: ShieldCheck,
      },
      {
        label: "All Rentals",
        href: "/dashboard/all-rentals",
        icon: ClipboardList,
      },
    ];
  }

  if (normalized === "owner") {
    return [
      { label: "Overview", href: "/dashboard", icon: LayoutGrid },
      {
        label: "Add Equipment",
        href: "/dashboard/add-equipment",
        icon: PackagePlus,
      },
      { label: "My Equipment", href: "/dashboard/my-equipment", icon: Package },
      {
        label: "Equipment Rentals",
        href: "/dashboard/owner-rentals",
        icon: CalendarCheck,
      },
    ];
  }

  return [
    { label: "Overview", href: "/dashboard", icon: LayoutGrid },
    { label: "My Rentals", href: "/dashboard/my-rentals", icon: CalendarCheck },
    { label: "My Favorites", href: "/dashboard/favorites", icon: Heart },
  ];
}

function SidebarAvatar({
  src,
  name,
}: {
  src?: string | null;
  name?: string | null;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const initials = (name || "U")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-coral-text ring-1 ring-border">
        {initials}
      </span>
    );
  }

  return (
    <span className="size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
      <Image
        src={src}
        alt={name || "User"}
        width={36}
        height={36}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user ?? null;

  useEffect(() => {
    if (!isPending && !user) {
      router.replace("/login");
    }
  }, [isPending, user, router]);

  if (isPending || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <IOSSpinner size={36} className="text-foreground/80" />
      </div>
    );
  }

  const roleLabel = (user.role || "Customer").toLowerCase();
  const roleNavItems = getRoleNavItems(user.role);

  const allItems: NavItem[] = [
    ...roleNavItems,
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];
  const currentTitle =
    allItems.find((item) => item.href === pathname)?.label ?? "Dashboard";

  async function handleLogout() {
    setLoggingOut(true);
    const { error } = await signOut();
    setLoggingOut(false);

    if (error) {
      toast.error(error.message || "Failed to log out.");
      return;
    }

    toast.success("Logged out successfully.");
    router.push("/");
    router.refresh();
  }

  return (
    <AnimatedSidebarProvider className="min-h-svh bg-background">
      <AnimatedSidebar
        ariaLabel="Apex Rentals workspace"
        collapsible="icon"
        variant="inset"
        panelClassName="border border-border/70 bg-card/60 backdrop-blur-xl"
      >
        {/* Brand header */}
        {/* Brand header */}
        <AnimatedSidebarHeader className="p-3 pb-2 group-data-[state=collapsed]/sidebar:px-0">
          <div className="flex min-h-11 items-center gap-3 overflow-hidden px-1.5 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0">
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center gap-2.5 outline-none group-data-[state=collapsed]/sidebar:flex-none"
            >
              <Image
                src="/logo.png"
                alt="Apex Rentals"
                width={32}
                height={32}
                className="aspect-square size-8 shrink-0 rounded-lg object-cover ring-1 ring-border"
              />
              <div className="min-w-0 group-data-[state=collapsed]/sidebar:hidden">
                <p className="truncate font-heading text-sm font-semibold text-foreground">
                  Apex Rentals
                </p>
                <p className="truncate text-[11px] capitalize text-coral-text">
                  {roleLabel} portal
                </p>
              </div>
            </Link>

            <AnimatedSidebarClose className="ml-auto text-muted-foreground hover:bg-muted md:hidden">
              <X aria-hidden="true" className="size-4" />
            </AnimatedSidebarClose>
          </div>
        </AnimatedSidebarHeader>

        {/* Navigation groups */}
        <AnimatedSidebarContent className="px-2 pt-1">
          <AnimatedSidebarGroup className="pb-2">
            <AnimatedSidebarGroupLabel>Explore</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                <AnimatedSidebarMenuItem>
                  <AnimatedSidebarMenuButton
                    icon={<Home className="size-4" />}
                    onSelect={() => router.push("/")}
                  >
                    Home
                  </AnimatedSidebarMenuButton>
                </AnimatedSidebarMenuItem>
                <AnimatedSidebarMenuItem>
                  <AnimatedSidebarMenuButton
                    icon={<Compass className="size-4" />}
                    onSelect={() => router.push("/equipment")}
                  >
                    All Equipment
                  </AnimatedSidebarMenuButton>
                </AnimatedSidebarMenuItem>
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          <AnimatedSidebarGroup className="pt-1">
            <AnimatedSidebarGroupLabel>
              {roleLabel} workspace
            </AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {roleNavItems.map(({ label, href, icon: Icon }) => (
                  <AnimatedSidebarMenuItem key={href}>
                    <AnimatedSidebarMenuButton
                      isActive={pathname === href}
                      icon={<Icon className="size-4" />}
                      onSelect={() => router.push(href)}
                    >
                      {label}
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                ))}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          <AnimatedSidebarGroup className="pt-1">
            <AnimatedSidebarGroupLabel>Account</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                <AnimatedSidebarMenuItem>
                  <AnimatedSidebarMenuButton
                    isActive={pathname === "/dashboard/profile"}
                    icon={<User className="size-4" />}
                    onSelect={() => router.push("/dashboard/profile")}
                  >
                    Profile
                  </AnimatedSidebarMenuButton>
                </AnimatedSidebarMenuItem>
                <AnimatedSidebarMenuItem>
                  <AnimatedSidebarMenuButton
                    disabled={loggingOut}
                    icon={<LogOut className="size-4" />}
                    onSelect={handleLogout}
                  >
                    {loggingOut ? "Logging out..." : "Logout"}
                  </AnimatedSidebarMenuButton>
                </AnimatedSidebarMenuItem>
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        </AnimatedSidebarContent>

        {/* User profile footer */}
        <AnimatedSidebarFooter className="gap-2 border-border/70 p-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-xl p-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <SidebarAvatar
              key={user.image}
              src={user.image}
              name={user.name}
            />
            <span className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
              <span className="block truncate text-sm font-medium text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground group-data-[state=collapsed]/sidebar:hidden"
            />
          </button>
        </AnimatedSidebarFooter>

        <AnimatedSidebarRail />
      </AnimatedSidebar>

      {/* Main content area */}
      <AnimatedSidebarInset className="min-h-svh border border-border/70 bg-background">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <AnimatedSidebarTrigger className="text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <PanelLeft aria-hidden="true" className="size-4" />
            </AnimatedSidebarTrigger>
            <div className="h-5 w-px bg-border" />
            <p className="text-sm font-medium text-foreground">
              {currentTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Press ⌘B to toggle
            </span>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-7">
          {children}
        </div>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}