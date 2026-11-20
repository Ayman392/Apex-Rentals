"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AdminRental = {
  _id: string;
  equipmentName?: string;
  equipmentTitle?: string;
  customerName?: string;
  renterName?: string;
  customerEmail?: string;
  renterEmail?: string;
  ownerEmail?: string;
  ownerName?: string;
  startDate?: string;
  rentalStartDate?: string;
  endDate?: string;
  rentalEndDate?: string;
  duration?: number;
  durationDays?: number;
  days?: number;
  rentalType?: string;
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

function badgeStyle(value: string) {
  const s = value.toLowerCase();
  if (s === "paid" || s === "confirmed" || s === "completed" || s === "active") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  }
  if (s === "pending") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  return "bg-rose-500/15 text-rose-400 border-rose-500/20";
}

export default function AllRentalsPage() {
  const { data: session, isPending } = useSession();
  const [rentals, setRentals] = useState<AdminRental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadAllRentals() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/admin/rentals`, {
          headers,
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load rentals");
        }

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

    loadAllRentals();
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
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          All Rentals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide rental bookings, payment states, and booking statuses.
        </p>
      </div>

      {rentals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <ClipboardList className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No rental records found
          </h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-center text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5 text-left">Equipment</th>
                  <th className="px-4 py-3.5 text-center">Customer</th>
                  <th className="px-4 py-3.5 text-center">Owner</th>
                  <th className="px-4 py-3.5 text-center">Duration</th>
                  <th className="px-4 py-3.5 text-center">Amount</th>
                  <th className="px-4 py-3.5 text-center">Payment</th>
                  <th className="px-5 py-3.5 text-center">Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {rentals.map((r) => {
                  const equipmentName =
                    r.equipmentName || r.equipmentTitle || "Equipment";
                  const customer =
                    r.customerName ||
                    r.renterName ||
                    r.customerEmail ||
                    r.renterEmail ||
                    "Customer";
                  const owner = r.ownerName || r.ownerEmail || "Owner";
                  const start = r.startDate || r.rentalStartDate;
                  const end = r.endDate || r.rentalEndDate;
                  const durationLabel =
                    r.duration || r.durationDays || r.days
                      ? `${r.duration || r.durationDays || r.days} ${
                          (r.rentalType || "Daily").toLowerCase().startsWith("w")
                            ? "wks"
                            : (r.rentalType || "Daily")
                                  .toLowerCase()
                                  .startsWith("m")
                              ? "mos"
                              : "days"
                        }`
                      : start && end
                        ? `${formatDate(start)} → ${formatDate(end)}`
                        : "—";
                  const amount = Number(
                    r.totalPrice ?? r.totalAmount ?? r.bookingAmount ?? r.amount ?? 0,
                  );
                  const paymentStatus = r.paymentStatus || "Pending";
                  const bookingStatus = r.bookingStatus || r.status || "Confirmed";

                  return (
                    <tr
                      key={r._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 text-left font-medium text-foreground">
                        {equipmentName}
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground">
                        {customer}
                      </td>
                      <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                        {owner}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-muted-foreground">
                        {durationLabel}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center font-semibold text-foreground">
                        ${amount.toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${badgeStyle(
                            paymentStatus,
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${badgeStyle(
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