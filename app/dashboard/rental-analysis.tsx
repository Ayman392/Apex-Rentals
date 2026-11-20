"use client";

import * as React from "react";
import {
  AreaTrend,
  BarCompare,
  ChartCard,
  DonutBreakdown,
  KpiCard,
} from "@/components/ui/revenue-charts-kpi";

interface MonthlyPoint {
  month: string;
  primary: number;
  secondary: number;
  completed: number;
  active: number;
  pending: number;
}

interface AnalyticsPayload {
  kpis?: {
    totalUsers?: number;
    totalEquipment?: number;
    totalBookings?: number;
    pendingApprovals?: number;
    completedRentals?: number;
    totalRevenue?: number;
    totalListedEquipment?: number;
    totalEarnings?: number;
  };
  monthly?: MonthlyPoint[];
  breakdown?: { label: string; value: number }[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

const usdShort = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`;
const usdFull = (v: number) => `$${v.toLocaleString()}`;

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === "undefined") return {};

  try {
    const res = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      const jwtToken =
        data?.token || data?.jwt || data?.accessToken || data?.data?.token;
      if (typeof jwtToken === "string" && jwtToken.trim()) {
        return { Authorization: `Bearer ${jwtToken.trim()}` };
      }
    }
  } catch {
    // Fall back to storage lookup below
  }

  const keys = [
    "accessToken",
    "token",
    "jwt",
    "authToken",
    "apex_token",
    "better-auth.session_token",
  ];
  for (const key of keys) {
    const raw =
      window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (raw) {
      const clean = raw
        .replace(/^Bearer\s+/i, "")
        .replace(/^"|"$/g, "")
        .trim();
      if (clean) {
        return { Authorization: `Bearer ${clean}` };
      }
    }
  }

  return {};
}

export interface RentalAnalyticsProps {
  role?: "admin" | "owner" | string;
}

export function RentalAnalytics({ role = "admin" }: RentalAnalyticsProps) {
  const isOwner = role.toLowerCase() === "owner";
  const [range, setRange] = React.useState<"6m" | "12m">("6m");
  const [payload, setPayload] = React.useState<AnalyticsPayload | null>(null);
  const [fetchedForOwner, setFetchedForOwner] = React.useState<boolean | null>(
    null,
  );

  const loading = fetchedForOwner !== isOwner;

  React.useEffect(() => {
    let active = true;
    const endpoint = isOwner ? "/owner/analytics" : "/admin/analytics";

    (async () => {
      try {
        const authHeaders = await getAuthHeaders();
        const res = await fetch(`${API_BASE}${endpoint}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        });

        if (!res.ok) {
          console.warn(
            `Analytics fetch returned ${res.status} for ${endpoint}`,
          );
          if (active) setFetchedForOwner(isOwner);
          return;
        }

        const data: AnalyticsPayload = await res.json();
        if (active) {
          setPayload(data);
          setFetchedForOwner(isOwner);
        }
      } catch (err) {
        console.warn("Analytics error:", err);
        if (active) {
          setFetchedForOwner(isOwner);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isOwner]);

  const fullMonthly = React.useMemo<MonthlyPoint[]>(() => {
    if (payload?.monthly?.length) return payload.monthly;
    const months = [
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
    ];
    return months.map((month) => ({
      month,
      primary: 0,
      secondary: 0,
      completed: 0,
      active: 0,
      pending: 0,
    }));
  }, [payload]);

  const sliceCount = range === "6m" ? 6 : 12;
  const visibleMonthly = fullMonthly.slice(-sliceCount);

  const areaData = visibleMonthly.map((m) => ({
    month: m.month,
    primary: m.primary,
    secondary: m.secondary,
  }));

  const barData = visibleMonthly.map((m) => ({
    month: m.month,
    completed: m.completed,
    active: m.active,
    pending: m.pending,
  }));

  const latest = visibleMonthly[visibleMonthly.length - 1] || {
    month: "Now",
    primary: 0,
    secondary: 0,
    completed: 0,
    active: 0,
    pending: 0,
  };
  const previous = visibleMonthly[visibleMonthly.length - 2] || latest;
  const first = visibleMonthly[0] || latest;

  const latestTotal = latest.primary + latest.secondary;
  const prevTotal = previous.primary + previous.secondary;
  const firstTotal = first.primary + first.secondary;

  const totalRevenueOrEarnings = isOwner
    ? (payload?.kpis?.totalEarnings ?? latestTotal)
    : (payload?.kpis?.totalRevenue ?? latestTotal);

  const totalItemsCount = isOwner
    ? (payload?.kpis?.totalListedEquipment ?? 0)
    : (payload?.kpis?.totalEquipment ?? 0);

  const completedCount = payload?.kpis?.completedRentals ?? 0;

  const breakdownSlices =
    payload?.breakdown && payload.breakdown.length > 0
      ? payload.breakdown
      : [{ label: "No rental data yet", value: 0 }];

  return (
    <div
      className="w-full"
      style={
        {
          "--chart-1": "var(--foreground)",
          "--chart-2":
            "color-mix(in oklch, var(--foreground) 55%, var(--background))",
          "--chart-3":
            "color-mix(in oklch, var(--foreground) 28%, var(--background))",
          "--chart-4":
            "color-mix(in oklch, var(--foreground) 75%, var(--background))",
          "--chart-5":
            "color-mix(in oklch, var(--foreground) 40%, var(--background))",
        } as React.CSSProperties
      }
    >
      <div className="grid w-full min-w-0 gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">
              {isOwner ? "Owner Earnings & Rentals" : "Platform Analytics"}
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {visibleMonthly[0]?.month} – {latest.month} ·{" "}
              {loading
                ? "Syncing live MongoDB data..."
                : firstTotal > 0
                  ? `${Math.round(((latestTotal - firstTotal) / firstTotal) * 100)}% over period`
                  : "Live database metrics"}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Range"
            className="inline-flex rounded-[10px] [corner-shape:squircle] bg-muted p-0.5"
          >
            {(["6m", "12m"] as const).map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className={`h-8 rounded-[8px] [corner-shape:squircle] px-3 text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                  range === r
                    ? "bg-background text-foreground shadow-sm"
                    : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {r === "6m" ? "6 months" : "12 months"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            label={isOwner ? "Total earnings" : "Total revenue"}
            value={usdFull(totalRevenueOrEarnings)}
            delta={prevTotal > 0 ? (latestTotal - prevTotal) / prevTotal : 0}
            period={`vs ${previous.month}`}
            trend={areaData.map((r) => r.primary + r.secondary)}
          />
          <KpiCard
            label={isOwner ? "Total listed equipment" : "Total equipment"}
            value={String(totalItemsCount)}
            delta={
              previous.completed > 0
                ? (latest.completed - previous.completed) / previous.completed
                : 0
            }
            period={`vs ${previous.month}`}
            trend={barData.map((b) => b.completed + b.active + b.pending)}
          />
          <KpiCard
            label="Completed rentals"
            value={String(completedCount)}
            delta={
              previous.pending > 0
                ? (latest.pending - previous.pending) / previous.pending
                : 0
            }
            good="down"
            period={`vs ${previous.month}`}
          />
        </div>

        {!isOwner && (
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              label="Total users"
              value={String(payload?.kpis?.totalUsers ?? 0)}
            />
            <KpiCard
              label="Total bookings"
              value={String(payload?.kpis?.totalBookings ?? 0)}
            />
            <KpiCard
              label="Pending approvals"
              value={String(payload?.kpis?.pendingApprovals ?? 0)}
              good="down"
            />
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title={isOwner ? "Monthly earnings trend" : "Monthly revenue trend"}
            subtitle={
              isOwner
                ? "Completed vs active rental amounts"
                : "Completed vs active booking amounts"
            }
          >
            <AreaTrend
              data={areaData}
              xKey="month"
              format={usdShort}
              description={`Monthly ${isOwner ? "earnings" : "revenue"}, ${visibleMonthly[0]?.month} to ${latest.month}`}
              series={[
                { key: "primary", label: "Completed" },
                { key: "secondary", label: "Active" },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={isOwner ? "Monthly rentals" : "Monthly booking statistics"}
            subtitle="By rental status"
          >
            <BarCompare
              data={barData}
              xKey="month"
              description={`Monthly bookings by status, ${visibleMonthly[0]?.month} to ${latest.month}`}
              series={[
                { key: "completed", label: "Completed" },
                { key: "active", label: "Active" },
                { key: "pending", label: "Pending" },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={`Where ${latest.month}'s ${isOwner ? "earnings" : "revenue"} came from`}
            className="lg:col-span-2"
          >
            <DonutBreakdown
              format={usdFull}
              description={`${latest.month} breakdown by category`}
              data={breakdownSlices}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default RentalAnalytics;