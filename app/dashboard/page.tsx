"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import RentalAnalytics from "@/app/dashboard/rental-analysis";
import { SectionTitle } from "@/components/ui/section-title";

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user?.role || "customer").toLowerCase();

  const quickLinks =
    role === "admin"
      ? [
          {
            title: "Manage Users",
            desc: "View all registered accounts and update roles.",
            href: "/dashboard/all-users",
          },
          {
            title: "Manage Equipment",
            desc: "Approve, reject, or remove owner equipment listings.",
            href: "/dashboard/all-equipment",
          },
          {
            title: "All Rentals",
            desc: "Track platform-wide bookings and payments.",
            href: "/dashboard/all-rentals",
          },
        ]
      : role === "owner"
        ? [
            {
              title: "Add Equipment",
              desc: "List new gear for customers to rent.",
              href: "/dashboard/add-equipment",
            },
            {
              title: "My Equipment",
              desc: "Edit pricing, stock, or remove your listings.",
              href: "/dashboard/my-equipment",
            },
            {
              title: "Equipment Rentals",
              desc: "See incoming bookings for your equipment.",
              href: "/dashboard/owner-rentals",
            },
          ]
        : [
            {
              title: "My Rentals",
              desc: "View your active bookings and payment receipts.",
              href: "/dashboard/my-rentals",
            },
            {
              title: "My Favorites",
              desc: "Quickly access equipment you saved for later.",
              href: "/dashboard/favorites",
            },
            {
              title: "Profile Settings",
              desc: "Update your name and profile photo.",
              href: "/dashboard/profile",
            },
          ];

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
            <SectionTitle className="text-3xl font-semibold" text={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
            />
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your {role} activity from your Apex Rentals dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-border bg-muted/30 p-5 transition-all hover:border-primary/40 hover:bg-muted/60"
            >
              <h3 className="font-semibold text-foreground">{card.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {card.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-coral-text">
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {(role === "admin" || role === "owner") && (
        <RentalAnalytics role={role} />
      )}
    </div>
  );
}