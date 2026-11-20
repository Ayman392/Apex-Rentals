"use client";

import * as React from "react";
import {
  AreaTrend,
  BarCompare,
  ChartCard,
  DonutBreakdown,
  KpiCard,
} from "@/components/ui/revenue-charts-kpi";

const RANGES = {
  "6m": ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  "12m": [
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
  ],
} as const;

const REVENUE_PRIMARY = [
  3100, 3400, 3800, 4100, 4600, 5200, 5800, 6400, 7100, 7900, 8800, 9600,
];
const REVENUE_SECONDARY = [
  1100, 1250, 1400, 1550, 1750, 1950, 2100, 2350, 2600, 2900, 3200, 3550,
];

const BOOKINGS_COMPLETED = [
  14, 16, 18, 21, 24, 27, 30, 34, 38, 42, 46, 51,
];
const BOOKINGS_ACTIVE = [8, 9, 11, 12, 14, 15, 17, 19, 21, 23, 25, 28];
const BOOKINGS_PENDING = [4, 5, 4, 6, 5, 7, 6, 8, 7, 6, 5, 4];

const usdShort = (v: number) =>
  v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`;
const usdFull = (v: number) => `$${v.toLocaleString()}`;

export interface RentalAnalyticsProps {
  role?: "admin" | "owner" | string;
}

export function RentalAnalytics({ role = "admin" }: RentalAnalyticsProps) {
  const isOwner = role.toLowerCase() === "owner";
  const [range, setRange] = React.useState<keyof typeof RANGES>("6m");

  const months = RANGES[range];
  const off = 12 - months.length;
  const scale = isOwner ? 0.45 : 1;

  const areaData = months.map((m, i) => ({
    month: m,
    primary: Math.round(REVENUE_PRIMARY[off + i] * scale),
    secondary: Math.round(REVENUE_SECONDARY[off + i] * scale),
  }));

  const barData = months.map((m, i) => ({
    month: m,
    completed: Math.max(1, Math.round(BOOKINGS_COMPLETED[off + i] * scale)),
    active: Math.max(1, Math.round(BOOKINGS_ACTIVE[off + i] * scale)),
    pending: Math.max(0, Math.round(BOOKINGS_PENDING[off + i] * scale)),
  }));

  const firstTotal = areaData[0].primary + areaData[0].secondary;
  const lastTotal =
    areaData[areaData.length - 1].primary +
    areaData[areaData.length - 1].secondary;
  const prevTotal =
    areaData[areaData.length - 2].primary +
    areaData[areaData.length - 2].secondary;

  const lastBookings =
    barData[barData.length - 1].completed +
    barData[barData.length - 1].active +
    barData[barData.length - 1].pending;
  const prevBookings =
    barData[barData.length - 2].completed +
    barData[barData.length - 2].active +
    barData[barData.length - 2].pending;

  const lastPending = barData[barData.length - 1].pending;
  const prevPending = Math.max(1, barData[barData.length - 2].pending);

  const lastMonthLabel = months[months.length - 1];
  const prevMonthLabel = months[months.length - 2];

  const breakdownSlices = isOwner
    ? [
        { label: "Photography & AV", value: 2450 },
        { label: "Construction Gear", value: 1820 },
        { label: "Event & Stage", value: 1180 },
      ]
    : [
        { label: "Construction Equipment", value: 5340 },
        { label: "Photography & Electronics", value: 4480 },
        { label: "Vehicles & Agriculture", value: 2080 },
      ];

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
              {months[0]} – {lastMonthLabel} · up{" "}
              {Math.max(
                0,
                Math.round((lastTotal / Math.max(1, firstTotal) - 1) * 100),
              )}
              % over the period
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
            label={isOwner ? "Monthly earnings" : "Monthly revenue"}
            value={usdFull(lastTotal)}
            delta={lastTotal / Math.max(1, prevTotal) - 1}
            period={`vs ${prevMonthLabel}`}
            trend={areaData.map((r) => r.primary + r.secondary)}
          />
          <KpiCard
            label={isOwner ? "Monthly rentals" : "Monthly bookings"}
            value={String(lastBookings)}
            delta={lastBookings / Math.max(1, prevBookings) - 1}
            period={`vs ${prevMonthLabel}`}
            trend={barData.map((b) => b.completed + b.active + b.pending)}
          />
          <KpiCard
            label={isOwner ? "Pending requests" : "Pending approvals"}
            value={String(lastPending)}
            delta={(lastPending - prevPending) / prevPending}
            good="down"
            period={`vs ${prevMonthLabel}`}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title={isOwner ? "Earnings trend" : "Revenue trend"}
            subtitle={
              isOwner
                ? "Direct rentals and extensions"
                : "Completed and active rentals"
            }
          >
            <AreaTrend
              data={areaData}
              xKey="month"
              format={usdShort}
              description={`Monthly ${isOwner ? "earnings" : "revenue"}, ${months[0]} to ${lastMonthLabel}`}
              series={[
                {
                  key: "primary",
                  label: isOwner ? "Direct" : "Completed",
                },
                {
                  key: "secondary",
                  label: isOwner ? "Extended" : "Active",
                },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={isOwner ? "Equipment rentals" : "Monthly bookings"}
            subtitle="By rental status"
          >
            <BarCompare
              data={barData}
              xKey="month"
              description={`Monthly bookings by status, ${months[0]} to ${lastMonthLabel}`}
              series={[
                { key: "completed", label: "Completed" },
                { key: "active", label: "Active" },
                { key: "pending", label: "Pending" },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={`Where ${lastMonthLabel}'s ${isOwner ? "earnings" : "revenue"} came from`}
            className="lg:col-span-2"
          >
            <DonutBreakdown
              format={usdFull}
              description={`${lastMonthLabel} breakdown by equipment category`}
              data={breakdownSlices}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default RentalAnalytics;