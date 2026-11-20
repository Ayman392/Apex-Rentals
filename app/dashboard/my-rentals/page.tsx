"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Compass, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type RentalRecord = {
  _id: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentTitle?: string;
  startDate?: string;
  rentalStartDate?: string;
  endDate?: string;
  rentalEndDate?: string;
  duration?: number;
  durationDays?: number;
  days?: number;
  rentalType?: string;
  bookingDate?: string;
  createdAt?: string;
  totalPrice?: number;
  totalAmount?: number;
  bookingAmount?: number;
  amount?: number;
  paymentStatus?: string;
  bookingStatus?: string;
  status?: string;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function computeEndDate(item: RentalRecord, startDate?: string) {
  const explicit = item.endDate || item.rentalEndDate;
  if (explicit) return explicit;

  const duration = Number(item.duration ?? item.durationDays ?? item.days ?? 0);
  if (!startDate || !duration) return undefined;

  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return undefined;

  const type = (item.rentalType || "Daily").toLowerCase();
  if (type === "weekly") d.setDate(d.getDate() + duration * 7);
  else if (type === "monthly") d.setMonth(d.getMonth() + duration);
  else d.setDate(d.getDate() + duration);

  return d.toISOString();
}

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  if (
    normalized === "paid" ||
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "active"
  ) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  }
  if (normalized === "pending") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  if (
    normalized === "cancelled" ||
    normalized === "failed" ||
    normalized === "rejected"
  ) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/20";
  }
  return "bg-muted text-muted-foreground border-border";
}

export default function MyRentalsPage() {
  const { data: session, isPending } = useSession();
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function fetchRentals() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/rentals/my`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load rentals");
        }

        const data = await res.json();
        if (!cancelled) {
          setRentals(Array.isArray(data.rentals) ? data.rentals : []);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load rentals",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRentals();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  if (isPending || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IOSSpinner size={32} className="text-foreground/80" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            My Rentals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your equipment bookings, rental dates, and payment statuses.
          </p>
        </div>

        <Link
          href="/equipment"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-fit rounded-full",
          )}
        >
          <Compass className="mr-1.5 size-4" />
          Browse Equipment
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <CalendarCheck className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No rentals yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Once you book and pay for equipment, your rental history will appear
            here.
          </p>
          <Link
            href="/equipment"
            className={cn(
              buttonVariants(),
              "shadow-coral mt-5 rounded-full px-6",
            )}
          >
            Explore Equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Equipment Name</th>
                  <th className="px-4 py-3.5 text-center">Rental Start Date</th>
                  <th className="px-4 py-3.5 text-center">Rental End Date</th>
                  <th className="px-4 py-3.5 text-center">Booking Date</th>
                  <th className="px-4 py-3.5 text-center">Total Amount</th>
                  <th className="px-4 py-3.5 text-center">Payment Status</th>
                  <th className="px-5 py-3.5 text-center">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rentals.map((item) => {
                  const name =
                    item.equipmentName || item.equipmentTitle || "Equipment";
                  const startDate = item.startDate || item.rentalStartDate;
                  const endDate = computeEndDate(item, startDate);
                  const bookingDate = item.bookingDate || item.createdAt;
                  const total = Number(
                    item.totalPrice ??
                      item.totalAmount ??
                      item.bookingAmount ??
                      item.amount ??
                      0,
                  );
                  const paymentStatus = item.paymentStatus || "Pending";
                  const bookingStatus =
                    item.bookingStatus || item.status || "Confirmed";

                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium text-foreground">
                        {item.equipmentId ? (
                          <Link
                            href={`/equipment/${item.equipmentId}`}
                            className="inline-flex items-center gap-1.5 hover:text-coral-text hover:underline"
                          >
                            <span className="max-w-[220px] truncate">
                              {name}
                            </span>
                            <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                          </Link>
                        ) : (
                          <span className="max-w-[220px] truncate">{name}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground text-center">
                        {formatDate(startDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground text-center">
                        {formatDate(endDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground text-center">
                        {formatDate(bookingDate)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-foreground text-center">
                        ${total.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(
                            paymentStatus,
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(
                            bookingStatus,
                          )}`}
                        >
                          {bookingStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}