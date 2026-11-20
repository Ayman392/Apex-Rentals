"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, ExternalLink, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type FavoriteItem = {
  _id: string;
  equipmentId?: string;
  name?: string;
  title?: string;
  equipmentName?: string;
  category?: string;
  price?: number;
  dailyRate?: number;
  pricePerDay?: number;
  rate?: number;
  rentalType?: string;
  image?: string;
  imageUrl?: string;
  equipment?: {
    _id?: string;
    name?: string;
    title?: string;
    category?: string;
    price?: number;
    dailyRate?: number;
    pricePerDay?: number;
    rate?: number;
    rentalType?: string;
    image?: string;
    imageUrl?: string;
  };
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

export default function MyFavoritesPage() {
  const { data: session, isPending } = useSession();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

async function loadFavorites() {
      try {
        const headers = await getAuthHeaders();
        const emailParam = encodeURIComponent(session?.user?.email || "");
        const res = await fetch(`${API_URL}/favorites?email=${emailParam}`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load favorites");
        }

        const data = await res.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.favorites)
            ? data.favorites
            : [];

        if (!cancelled) {
          setFavorites(list);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load favorites",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFavorites();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  async function handleRemove(fav: FavoriteItem) {
    const targetId = fav._id;
    setRemovingId(targetId);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/favorites/${targetId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to remove favorite");
      }

      setFavorites((prev) => prev.filter((item) => item._id !== targetId));
      toast.success("Removed from favorites.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove favorite",
      );
    } finally {
      setRemovingId(null);
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
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            My Favorites
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Equipment you saved for quick access and booking.
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

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <Heart className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No saved favorites yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Save equipment while browsing so you can easily compare or book it
            later.
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
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Rate</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {favorites.map((fav) => {
                  const eq = fav.equipment;
                  const equipmentId =
                    fav.equipmentId || eq?._id || fav._id;
                  const name =
                    fav.name ||
                    fav.title ||
                    fav.equipmentName ||
                    eq?.name ||
                    eq?.title ||
                    "Equipment";
                  const category = fav.category || eq?.category || "General";
                  const rawRate =
                    fav.price ??
                    fav.dailyRate ??
                    fav.pricePerDay ??
                    fav.rate ??
                    eq?.price ??
                    eq?.dailyRate ??
                    eq?.pricePerDay ??
                    eq?.rate;
                  const rateNum = Number(rawRate ?? 0);
                  const unit = (fav.rentalType || eq?.rentalType || "Daily")
                    .toLowerCase()
                    .replace(/ly$/, "");
                  const imageSrc =
                    fav.image || fav.imageUrl || eq?.image || eq?.imageUrl || "";
                  const isRemoving = removingId === fav._id;

                  return (
                    <tr
                      key={fav._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            {imageSrc ? (
                              <Image
                                src={imageSrc}
                                alt={name}
                                width={44}
                                height={44}
                                unoptimized
                                referrerPolicy="no-referrer"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="grid size-full place-items-center text-xs font-semibold text-muted-foreground">
                                {name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <span className="max-w-[240px] truncate font-medium text-foreground">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {category}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-foreground">
                        ${rateNum.toFixed(2)}{" "}
                        <span className="text-xs font-normal capitalize text-muted-foreground">
                          / {unit || "day"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <Link
                            href={`/equipment/${equipmentId}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full",
                            )}
                          >
                            View Details
                            <ExternalLink className="ml-1 size-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isRemoving}
                            onClick={() => handleRemove(fav)}
                            className={cn(
                              buttonVariants({ variant: "destructive", size: "sm" }),
                              "rounded-full",
                            )}
                          >
                            {isRemoving ? (
                              <IOSSpinner size={14} />
                            ) : (
                              <>
                                <Trash2 className="mr-1 size-3.5" />
                                Remove Favorite
                              </>
                            )}
                          </button>
                        </div>
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