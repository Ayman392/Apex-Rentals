"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
} from "lucide-react";
import { IOSSpinner } from "@/components/ui/ios-spinner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
] as const;

const RENTAL_TYPES = [
  { value: "all", label: "Any rental type" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
] as const;

const SORTS = [
  { value: "newest", label: "Recently Added" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

const PRICE_MIN = 0;
const PRICE_MAX = 20000;

type EquipmentItem = {
  _id: string;
  name: string;
  category: string;
  price: number;
  rentalType: string;
  location: string;
  availableQuantity: number;
  image?: string;
  imageUrl?: string;
};

type EquipmentResponse = {
  items: EquipmentItem[];
  total: number;
  page: number;
  pages: number;
};

interface Filters {
  search: string;
  category: string;
  location: string;
  rentalType: string;
  price: [number, number];
  availableOnly: boolean;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  category: "all",
  location: "",
  rentalType: "all",
  price: [PRICE_MIN, PRICE_MAX],
  availableOnly: false,
};

interface FilterPanelProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const minPercent =
    ((filters.price[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPercent =
    ((filters.price[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* CATEGORY */}
      <fieldset className="flex flex-col gap-2 pb-6">
        <legend className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Category
        </legend>
        {CATEGORIES.map((cat) => {
          const checked = filters.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ category: checked ? "all" : cat })}
              className="group flex items-center gap-3 text-left text-sm transition-colors"
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition ${
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/40 bg-transparent group-hover:border-foreground"
                }`}
              >
                {checked && <Check className="size-2.5 stroke-[3]" />}
              </span>
              <span
                className={
                  checked
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }
              >
                {cat}
              </span>
            </button>
          );
        })}
      </fieldset>

      {/* PRICE */}
      <fieldset className="flex flex-col gap-4 py-6">
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Price
        </legend>
        <div className="relative flex h-5 items-center">
          <div className="h-1.5 w-full rounded-full bg-muted" />
          <div
            className="absolute h-1.5 rounded-full bg-primary"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          <input
            type="range"
            aria-label="Minimum price"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            value={filters.price[0]}
            onChange={(e) => {
              const nextMin = Math.min(
                Number(e.target.value),
                filters.price[1] - 10,
              );
              onChange({ price: [nextMin, filters.price[1]] });
            }}
            className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background"
          />
          <input
            type="range"
            aria-label="Maximum price"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={10}
            value={filters.price[1]}
            onChange={(e) => {
              const nextMax = Math.max(
                Number(e.target.value),
                filters.price[0] + 10,
              );
              onChange({ price: [filters.price[0], nextMax] });
            }}
            className="pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background"
          />
        </div>
        <div className="flex items-center justify-between text-sm tabular-nums text-foreground">
          <span>${filters.price[0]}</span>
          <span>
            ${filters.price[1]}
            {filters.price[1] === PRICE_MAX && "+"}
          </span>
        </div>
      </fieldset>

      {/* LOCATION */}
      <fieldset className="flex flex-col gap-3 py-6">
        <legend className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Location
        </legend>
        <div className="flex items-center gap-2 rounded-xl border border-input bg-muted/40 px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="City or area..."
            value={filters.location}
            onChange={(e) => onChange({ location: e.target.value })}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </fieldset>

      {/* AVAILABLE ONLY SWITCH */}
      <div className="flex items-center justify-between py-6">
        <span className="text-sm text-foreground">Available only</span>
        <button
          type="button"
          role="switch"
          aria-checked={filters.availableOnly}
          onClick={() => onChange({ availableOnly: !filters.availableOnly })}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
            filters.availableOnly
              ? "border-primary bg-primary"
              : "border-border bg-muted"
          }`}
        >
          <span
            className={`pointer-events-none block size-3.5 rounded-full bg-background shadow transition-transform ${
              filters.availableOnly ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* RENTAL TYPE */}
      <fieldset className="flex flex-col gap-3 pt-6">
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Rental Type
        </legend>
        {RENTAL_TYPES.map((option) => {
          const selected = filters.rentalType === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ rentalType: option.value })}
              className="group flex items-center gap-3 text-left text-sm transition-colors"
            >
              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded-full border transition ${
                  selected
                    ? "border-primary"
                    : "border-muted-foreground/40 group-hover:border-foreground"
                }`}
              >
                {selected && (
                  <span className="size-2 rounded-full bg-primary" />
                )}
              </span>
              <span
                className={
                  selected
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                }
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

function EquipmentCatalog() {
  const searchParams = useSearchParams();
  const paramCat = searchParams.get("category") || "all";

  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    category: paramCat,
  });
  const [prevParamCat, setPrevParamCat] = useState(paramCat);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [data, setData] = useState<EquipmentResponse>({
    items: [],
    total: 0,
    page: 1,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync category from Navbar link changes without setState inside useEffect
  if (paramCat !== prevParamCat) {
    setPrevParamCat(paramCat);
    setFilters((prev) => ({ ...prev, category: paramCat }));
    setPage(1);
  }

  function updateFilters(patch: Partial<Filters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function goToPage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters.search.trim()) params.set("search", filters.search.trim());
        if (filters.category !== "all") params.set("category", filters.category);
        if (filters.location.trim())
          params.set("location", filters.location.trim());
        if (filters.rentalType !== "all")
          params.set("rentalType", filters.rentalType);
        if (filters.price[0] > PRICE_MIN)
          params.set("minPrice", String(filters.price[0]));
        if (filters.price[1] < PRICE_MAX)
          params.set("maxPrice", String(filters.price[1]));
        if (filters.availableOnly) params.set("availability", "available");
        params.set("sort", sort);
        params.set("page", String(page));
        params.set("limit", "9");

        const res = await fetch(`${API_BASE}/equipment?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Failed to load equipment.");
        const json: EquipmentResponse = await res.json();
        setData(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [filters, sort, page]);

  // Build active filter chips
  const activeChips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.search.trim()) {
    activeChips.push({
      key: "search",
      label: `"${filters.search.trim()}"`,
      remove: () => updateFilters({ search: "" }),
    });
  }
  if (filters.category !== "all") {
    activeChips.push({
      key: "category",
      label: filters.category,
      remove: () => updateFilters({ category: "all" }),
    });
  }
  if (filters.price[0] !== PRICE_MIN || filters.price[1] !== PRICE_MAX) {
    activeChips.push({
      key: "price",
      label: `$${filters.price[0]} – $${filters.price[1]}${filters.price[1] === PRICE_MAX ? "+" : ""}`,
      remove: () => updateFilters({ price: [PRICE_MIN, PRICE_MAX] }),
    });
  }
  if (filters.location.trim()) {
    activeChips.push({
      key: "location",
      label: filters.location.trim(),
      remove: () => updateFilters({ location: "" }),
    });
  }
  if (filters.availableOnly) {
    activeChips.push({
      key: "availability",
      label: "Available only",
      remove: () => updateFilters({ availableOnly: false }),
    });
  }
  if (filters.rentalType !== "all") {
    activeChips.push({
      key: "rentalType",
      label: filters.rentalType,
      remove: () => updateFilters({ rentalType: "all" }),
    });
  }

  return (
    <section className="min-h-screen pt-28 pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 md:px-10">
        {/* Editorial Header */}
        <div className="flex max-w-xl flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-coral-text">
            Rentals
          </span>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            All Equipment
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Verified tools, cameras, vehicles, and event gear ready to book by
            the day, week, or month.
          </p>
        </div>

        {/* Main Sidebar + Results Grid */}
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          {/* Desktop Sticky Filter Sidebar */}
          <aside
            aria-label="Filters"
            className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-sm font-medium text-foreground">
                Filters
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={activeChips.length === 0}
                className="text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                Clear all
              </button>
            </div>
            <div className="pt-6">
              <FilterPanel filters={filters} onChange={updateFilters} />
            </div>
          </aside>

          {/* Right Column: Toolbar + Cards */}
          <div className="flex min-w-0 flex-col gap-6">
            {/* Top Toolbar */}
            <div className="flex flex-col gap-4 border-b border-border pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Filters Trigger */}
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(true)}
                    className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-xs font-medium text-foreground transition hover:bg-muted lg:hidden"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {activeChips.length > 0 && (
                      <span className="tabular-nums">
                        ({activeChips.length})
                      </span>
                    )}
                  </button>

                  <p
                    aria-live="polite"
                    className="text-sm tabular-nums text-muted-foreground"
                  >
                    {loading
                      ? "Loading..."
                      : `${data.total} ${data.total === 1 ? "item" : "items"}`}
                  </p>
                </div>

                {/* Search + Sort */}
                <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
                  <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 sm:w-56">
                    <Search className="size-3.5 shrink-0 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      value={filters.search}
                      onChange={(e) =>
                        updateFilters({ search: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  <select
                    aria-label="Sort equipment"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 min-w-44 rounded-lg border border-input bg-muted/40 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {SORTS.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="bg-popover text-popover-foreground"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeChips.length > 0 && (
                <ul
                  aria-label="Active filters"
                  className="flex flex-wrap items-center gap-2"
                >
                  {activeChips.map((chip) => (
                    <li key={chip.key}>
                      <span className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 ps-3 pe-1 text-xs text-foreground">
                        {chip.label}
                        <button
                          type="button"
                          aria-label={`Remove ${chip.label}`}
                          onClick={chip.remove}
                          className="grid size-5 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="px-1 text-xs text-muted-foreground transition hover:text-foreground hover:underline"
                    >
                      Clear all
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            {/* 3-Column Equipment Grid / iOS Spinner */}
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-3">
                <IOSSpinner size={32} className="text-foreground/80" />
              </div>
            ) : data.items.length > 0 ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                {data.items.map((item) => {
                  const imgSrc =
                    item.image || item.imageUrl || "/placeholder.png";
                  const isAvailable = item.availableQuantity > 0;

                  return (
                    <article
                      key={item._id}
                      className="group flex flex-col gap-3"
                    >
                      {/* Tall Editorial Image Card */}
                      <Link
                        href={`/equipment/${item._id}`}
                        className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-muted"
                      >
                        <Image
                          src={imgSrc}
                          alt={item.name}
                          fill
                          unoptimized
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                          className={`object-cover transition-transform duration-300 ease-out group-hover:scale-105 ${
                            !isAvailable ? "opacity-60" : ""
                          }`}
                        />
                        <span
                          className={`absolute start-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md ${
                            isAvailable
                              ? "glass-on-photo"
                              : "bg-background/85 text-foreground ring-1 ring-border"
                          }`}
                        >
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </Link>

                      {/* Clean Editorial Info */}
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="line-clamp-1 text-sm font-semibold text-foreground">
                            {item.name}
                          </h2>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                            ${item.price}
                            <span className="text-xs font-normal text-muted-foreground">
                              /{item.rentalType}
                            </span>
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>

                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0 text-coral-text" />
                          <span className="line-clamp-1">{item.location}</span>
                        </p>

                        <Link
                          href={`/equipment/${item._id}`}
                          className="mt-2 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/40 text-xs font-medium text-foreground transition hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
                        >
                          View Details
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border py-16 text-center">
                <h2 className="text-base font-semibold text-foreground">
                  Nothing matches those filters
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try widening your price range, clearing the location, or
                  browsing another category.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3 border-t border-border pt-6">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  className="flex h-9 items-center gap-1 rounded-lg border border-border px-3.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  Page {data.page} of {data.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pages || loading}
                  onClick={() => goToPage(Math.min(data.pages, page + 1))}
                  className="flex h-9 items-center gap-1 rounded-lg border border-border px-3.5 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="glass-strong flex max-h-[85svh] flex-col rounded-t-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Filters
                </h2>
                <p className="text-xs text-muted-foreground">
                  Results update as you change them.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5">
              <FilterPanel filters={filters} onChange={updateFilters} />
            </div>

            <div className="flex items-center gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                onClick={clearAll}
                disabled={activeChips.length === 0}
                className="h-10 rounded-lg border border-border px-4 text-xs font-medium text-foreground transition hover:bg-muted disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="shadow-coral h-10 flex-1 rounded-lg bg-primary text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {data.total === 0
                  ? "No matches"
                  : `Show ${data.total} ${data.total === 1 ? "result" : "results"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function AllEquipmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-28">
          <IOSSpinner size={32} className="text-foreground/80" />
        </div>
      }
    >
      <EquipmentCatalog />
    </Suspense>
  );
}