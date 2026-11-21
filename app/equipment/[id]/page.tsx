"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  Heart,
  Layers,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  Tag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { buildEquipmentUrl, extractSlugOrId } from "@/lib/slug";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type EquipmentDetail = {
  _id: string;
  name: string;
  slug?: string;
  category: string;
  price: number;
  rentalType: "Daily" | "Weekly" | "Monthly" | string;
  location: string;
  availableQuantity: number;
  description?: string;
  image?: string;
  imageUrl?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
};

function durationUnit(rentalType: string, count: number) {
  const base =
    rentalType === "Weekly"
      ? "week"
      : rentalType === "Monthly"
        ? "month"
        : "day";
  return count === 1 ? base : `${base}s`;
}

export default function EquipmentDetailsPage() {
  const params = useParams<{ id: string }>();
  const rawSlug = params?.id || "";

  return <EquipmentDetailsContent key={rawSlug} rawSlug={rawSlug} />;
}

function EquipmentDetailsContent({ rawSlug }: { rawSlug: string }) {
  const parsedParam = extractSlugOrId(rawSlug);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user ?? null;

  const [bookingOpen, setBookingOpen] = useState(false);

  const [item, setItem] = useState<EquipmentDetail | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [fetchedSlug, setFetchedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Favorites state
  const [favoriting, setFavoriting] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking modal state
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [duration, setDuration] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  const isSlugLoaded = fetchedSlug === rawSlug;

  // Private route guard: store return path in sessionStorage and redirect cleanly to /login
  useEffect(() => {
    if (!isPending && !user && rawSlug) {
      try {
        sessionStorage.setItem("apex_callback_url", `/equipment/${rawSlug}`);
      } catch {
        // Ignore storage errors in restricted browsing modes
      }
      router.replace("/login");
    }
  }, [isPending, user, rawSlug, router]);

  // Fetch equipment details by ID or slug
  useEffect(() => {
    if ((!parsedParam.id && !parsedParam.slug) || isPending || !user) return;

    const controller = new AbortController();

    async function loadEquipment() {
      setError(null);
      try {
        const endpoint = parsedParam.id
          ? `${API_BASE}/equipment/${encodeURIComponent(parsedParam.id)}`
          : `${API_BASE}/equipment/slug/${encodeURIComponent(parsedParam.slug)}`;

        const res = await fetch(endpoint, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? "Equipment not found or not yet approved."
              : "Failed to load equipment details.",
          );
        }
        const data: EquipmentDetail = await res.json();
        if (controller.signal.aborted) return;

        setItem(data);
        setImgFailed(false);
        setError(null);

        // Normalize /equipment/<id> or /equipment/<slug>-<id> to clean /equipment/<slug>
        const canonicalPath = buildEquipmentUrl(data);
        const currentPath = `/equipment/${decodeURIComponent(rawSlug).trim()}`;
        if (rawSlug && currentPath !== canonicalPath) {
          router.replace(canonicalPath, { scroll: false });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Something went wrong.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setFetchedSlug(rawSlug);
        }
      }
    }

    loadEquipment();
    return () => controller.abort();
  }, [parsedParam.id, parsedParam.slug, isPending, user, rawSlug, router]);

  async function handleAddToFavorites() {
    if (!item || !user) return;
    setFavoriting(true);
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          equipmentId: item._id,
          userEmail: user.email,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Could not add to favorites.");
      }

      setIsFavorited(true);
      toast.success("Added to your favorites!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update favorites.",
      );
    } finally {
      setFavoriting(false);
    }
  }

  async function handleProceedToPayment() {
    if (!item || !user) return;

    if (quantity < 1 || quantity > item.availableQuantity) {
      toast.error(
        `Please select between 1 and ${item.availableQuantity} units.`,
      );
      return;
    }
    if (duration < 1) {
      toast.error("Rental duration must be at least 1.");
      return;
    }

    setBookingLoading(true);
    try {
      const totalPrice = item.price * duration * quantity;

      const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          equipmentId: item._id,
          equipmentName: item.name,
          price: item.price,
          rentalType: item.rentalType,
          startDate,
          duration,
          quantity,
          totalPrice,
          customerEmail: user.email,
          customerName: user.name,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to start checkout.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      toast.success("Booking created!");
      setBookingOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to start payment.",
      );
    } finally {
      setBookingLoading(false);
    }
  }

  // Loading / Auth pending state
  if (isPending || (!user && !error) || !isSlugLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <IOSSpinner size={34} className="text-foreground/80" />
      </div>
    );
  }

  // Error or not found
  if (error || !item) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="glass w-full rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-foreground">
            {error || "Equipment not found"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This item may have been removed or is no longer available.
          </p>
          <Link
            href="/equipment"
            className={cn(buttonVariants(), "shadow-coral mt-6 rounded-full")}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to All Equipment
          </Link>
        </div>
      </div>
    );
  }

  const rawImgSrc = item.image || item.imageUrl;
  const imgSrc = !imgFailed && rawImgSrc ? rawImgSrc : "/demo/1.jpg";
  const isAvailable = item.availableQuantity > 0;
  const isOwner = user?.email && item.ownerEmail === user.email;
  const totalCost = item.price * duration * quantity;

  return (
    <section className="min-h-screen pt-28 pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        {/* Back Breadcrumb */}
        <Link
          href="/equipment"
          className="mb-8 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to All Equipment
        </Link>

        {/* Main 2-Column Editorial Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Image Frame */}
          <div className="lg:col-span-6">
            <div className="glass sticky top-24 overflow-hidden rounded-2xl p-2.5">
              <div className="relative aspect-[4/4] w-full overflow-hidden rounded-xl bg-muted">
                <Image
                  src={imgSrc}
                  alt={item.name}
                  fill
                  priority
                  unoptimized
                  onError={() => setImgFailed(true)}
                  className="object-cover"
                />
                <div className="absolute start-3 top-3">
                  <Badge
                    className={
                      isAvailable
                        ? "border-0 bg-emerald-500/85 text-white backdrop-blur-md hover:bg-emerald-500/85"
                        : "border-0 bg-rose-500/85 text-white backdrop-blur-md hover:bg-rose-500/85"
                    }
                  >
                    {isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Metadata & Actions */}
          <div className="flex flex-col gap-6 lg:col-span-6">
            {/* Category + Title + Price */}
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="rounded-full border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-coral-text"
              >
                {item.category}
              </Badge>

              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {item.name}
              </h1>

              <div className="flex flex-wrap items-baseline gap-2 pt-1">
                <span className="text-3xl font-bold tabular-nums text-foreground">
                  ${item.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {item.rentalType}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-border" />

            {/* Quick Spec Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-coral-text" />
                  Location
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.location}
                </p>
              </div>

              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="size-3.5 text-coral-text" />
                  Available Units
                </div>
                <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
                  {item.availableQuantity}{" "}
                  {item.availableQuantity === 1 ? "unit" : "units"}
                </p>
              </div>

              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="size-3.5 text-coral-text" />
                  Rental Type
                </div>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {item.rentalType}
                </p>
              </div>

              <div className="glass rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers className="size-3.5 text-coral-text" />
                  Category
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
                  {item.category}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description ||
                  "Well-maintained, verified equipment ready for immediate rental. Inspected before every handover."}
              </p>
            </div>

            {/* Owner Info */}
            {(item.ownerName || item.ownerEmail) && (
              <div className="glass flex items-center gap-3 rounded-xl p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-coral-text">
                  <User className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Listed by</p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.ownerName || item.ownerEmail}
                  </p>
                </div>
                <div className="ms-auto flex items-center gap-1 text-xs text-emerald-500">
                  <ShieldCheck className="size-4" />
                  Verified
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={() => setBookingOpen(true)}
                disabled={!isAvailable || Boolean(isOwner)}
                className="shadow-coral h-11 rounded-full bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:flex-1"
              >
                <Calendar className="mr-2 size-4" />
                {isOwner
                  ? "Your Listing"
                  : isAvailable
                    ? "Book Equipment"
                    : "Currently Unavailable"}
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleAddToFavorites}
                disabled={favoriting || isFavorited}
                className="h-11 rounded-full px-6 text-sm font-medium"
              >
                <Heart
                  className={`mr-2 size-4 ${
                    isFavorited ? "fill-primary text-primary" : ""
                  }`}
                />
                {isFavorited
                  ? "Saved"
                  : favoriting
                    ? "Saving..."
                    : "Add to Favorites"}
              </Button>
            </div>

            {/* Trust note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              Secure Stripe checkout with instant booking confirmation.
            </div>
          </div>
        </div>
      </div>

      {/* shadcn Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="glass-strong rounded-2xl border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Book {item.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ${item.price} / {item.rentalType} · {item.availableQuantity}{" "}
              available
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="start-date"
                className="block text-xs font-medium text-foreground"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                min={todayStr}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-muted/50 px-3 text-sm text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Duration & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="duration"
                  className="block text-xs font-medium text-foreground"
                >
                  Duration ({durationUnit(item.rentalType, 2)})
                </label>
                <input
                  id="duration"
                  type="number"
                  min={1}
                  max={90}
                  value={duration}
                  onChange={(e) =>
                    setDuration(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="h-10 w-full rounded-xl border border-input bg-muted/50 px-3 text-sm tabular-nums text-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-foreground">
                  Quantity
                </span>
                <div className="flex h-10 items-center justify-between rounded-xl border border-input bg-muted/50 px-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid size-7 place-items-center rounded-lg text-foreground transition hover:bg-muted disabled:opacity-40"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= item.availableQuantity}
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(item.availableQuantity, q + 1),
                      )
                    }
                    className="grid size-7 place-items-center rounded-lg text-foreground transition hover:bg-muted disabled:opacity-40"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  ${item.price} × {duration}{" "}
                  {durationUnit(item.rentalType, duration)} × {quantity}{" "}
                  {quantity === 1 ? "unit" : "units"}
                </span>
                <span className="tabular-nums">${totalCost}</span>
              </div>
              <div className="my-3 h-px w-full bg-border" />
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Total</span>
                <span className="text-lg tabular-nums text-coral-text">
                  ${totalCost}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setBookingOpen(false)}
              disabled={bookingLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleProceedToPayment}
              disabled={bookingLoading}
              className="shadow-coral rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <CreditCard className="mr-2 size-4" />
              {bookingLoading
                ? "Redirecting..."
                : `Pay $${totalCost} with Stripe`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}