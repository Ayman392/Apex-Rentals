"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { buildEquipmentUrl } from "@/lib/slug";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Active",
  "Completed",
  "Cancelled",
] as const;

type OwnerRentalRecord = {
  _id: string;
  equipmentId?: string;
  equipmentName?: string;
  equipmentTitle?: string;
  customerName?: string;
  renterName?: string;
  customerEmail?: string;
  renterEmail?: string;
  email?: string;
  customer?: { name?: string; email?: string };
  startDate?: string;
  rentalStartDate?: string;
  endDate?: string;
  rentalEndDate?: string;
  duration?: number;
  durationDays?: number;
  days?: number;
  rentalType?: string;
  quantity?: number;
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

function computeEndDate(item: OwnerRentalRecord, startDate?: string) {
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

function paymentBadge(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "paid" || normalized === "completed") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  }
  if (normalized === "pending") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  return "bg-rose-500/15 text-rose-400 border-rose-500/20";
}

export default function BookingRequestsPage() {
  const { data: session, isPending } = useSession();
  const [rentals, setRentals] = useState<OwnerRentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadBookings() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/rentals/owner`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load booking requests");
        }

        const data = await res.json();
        if (!cancelled) {
          setRentals(Array.isArray(data.rentals) ? data.rentals : []);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to load booking requests",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  async function handleStatusChange(rentalId: string, nextStatus: string) {
    setUpdatingId(rentalId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/rentals/${rentalId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ bookingStatus: nextStatus }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update booking status");
      }

      setRentals((prev) =>
        prev.map((row) =>
          row._id === rentalId
            ? { ...row, bookingStatus: nextStatus, status: nextStatus }
            : row,
        ),
      );
      toast.success(`Booking updated to ${nextStatus}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update booking status",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IOSSpinner size={32} className="text-foreground/80" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Booking Requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review incoming customer rentals for your equipment and manage booking
          statuses.
        </p>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <CalendarClock className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No booking requests yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            When customers book your listed equipment, their rental details will
            appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Rental Period</th>
                  <th className="px-4 py-3.5 text-center">Quantity</th>
                  <th className="px-4 py-3.5">Total</th>
                  <th className="px-4 py-3.5 text-center">Payment</th>
                  <th className="px-5 py-3.5 text-right">Booking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rentals.map((item) => {
                  const equipmentName =
                    item.equipmentName || item.equipmentTitle || "Equipment";
                  const customerName =
                    item.customerName ||
                    item.renterName ||
                    item.customer?.name ||
                    "Customer";
                  const customerEmail =
                    item.customerEmail ||
                    item.renterEmail ||
                    item.customer?.email ||
                    item.email ||
                    "";
                  const startDate = item.startDate || item.rentalStartDate;
                  const endDate = computeEndDate(item, startDate);
                  const quantity = item.quantity ?? 1;
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
                  const isUpdating = updatingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium text-foreground">
                        {item.equipmentId ? (
                          <Link
                            href={buildEquipmentUrl({
                              _id: item.equipmentId,
                              name: equipmentName,
                            })}
                            className="inline-flex items-center gap-1.5 hover:text-coral-text hover:underline"
                          >
                            <span className="max-w-[200px] truncate">
                              {equipmentName}
                            </span>
                            <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                          </Link>
                        ) : (
                          <span className="max-w-[200px] truncate">
                            {equipmentName}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">
                          {customerName}
                        </div>
                        {customerEmail && (
                          <div className="text-xs text-muted-foreground">
                            {customerEmail}
                          </div>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatDate(startDate)} → {formatDate(endDate)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center font-medium text-foreground">
                        {quantity}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-foreground">
                        ${total.toFixed(2)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${paymentBadge(
                            paymentStatus,
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <select
                          disabled={isUpdating}
                          value={bookingStatus}
                          onChange={(e) =>
                            handleStatusChange(item._id, e.target.value)
                          }
                          className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:border-primary focus:outline-none disabled:opacity-50"
                        >
                          {BOOKING_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
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