"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Boxes,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type EquipmentItem = {
  _id: string;
  name: string;
  category?: string;
  location?: string;
  rentalType?: string;
  price?: number;
  totalQuantity?: number;
  availableQuantity?: number;
  image?: string;
  description?: string;
  status?: string;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

export default function MyEquipmentPage() {
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    location: "",
    rentalType: "Daily",
    price: "",
    availableQuantity: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadMyEquipment() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/equipment/my`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Failed to load equipment");
        }

        const data = await res.json();
        if (!cancelled) {
          setItems(Array.isArray(data.equipment) ? data.equipment : []);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load equipment",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMyEquipment();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  function openEdit(item: EquipmentItem) {
    setEditingItem(item);
    setEditForm({
      name: item.name || "",
      category: item.category || "",
      location: item.location || "",
      rentalType: item.rentalType || "Daily",
      price: String(item.price ?? ""),
      availableQuantity: String(item.availableQuantity ?? 1),
      image: item.image || "",
      description: item.description || "",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/equipment/${editingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          location: editForm.location,
          rentalType: editForm.rentalType,
          price: Number(editForm.price),
          availableQuantity: Number(editForm.availableQuantity),
          image: editForm.image,
          description: editForm.description,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update listing");
      }

      const data = await res.json();
      setItems((prev) =>
        prev.map((row) =>
          row._id === editingItem._id ? (data.equipment || { ...row, ...editForm, price: Number(editForm.price), availableQuantity: Number(editForm.availableQuantity) }) : row,
        ),
      );
      toast.success("Listing updated.");
      setEditingItem(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update listing",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/equipment/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete listing");
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Equipment listing deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete listing",
      );
    } finally {
      setDeletingId(null);
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
            My Equipment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your listed equipment, rates, and availability.
          </p>
        </div>

        <Link
          href="/dashboard/add-equipment"
          className={cn(buttonVariants(), "shadow-coral w-fit rounded-full")}
        >
          <Plus className="mr-1.5 size-4" />
          Add Equipment
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <Boxes className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No equipment listed yet
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add your first piece of equipment to start receiving rental
            bookings.
          </p>
          <Link
            href="/dashboard/add-equipment"
            className={cn(
              buttonVariants(),
              "shadow-coral mt-5 rounded-full px-6",
            )}
          >
            Add Equipment
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Rate</th>
                  <th className="px-4 py-3.5 text-center">Available</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.map((item) => {
                  const avail = Number(item.availableQuantity ?? 0);
                  const unit = (item.rentalType || "Daily")
                    .toLowerCase()
                    .replace(/ly$/, "");
                  const isDeleting = deletingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={44}
                                height={44}
                                unoptimized
                                referrerPolicy="no-referrer"
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="grid size-full place-items-center text-xs font-semibold text-muted-foreground">
                                {item.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/equipment/${item._id}`}
                              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-coral-text hover:underline"
                            >
                              <span className="max-w-[220px] truncate">
                                {item.name}
                              </span>
                              <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                            </Link>
                            {item.location && (
                              <p className="text-xs text-muted-foreground">
                                {item.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {item.category || "General"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-foreground">
                        ${Number(item.price ?? 0).toFixed(2)}{" "}
                        <span className="text-xs font-normal capitalize text-muted-foreground">
                          / {unit || "day"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            avail > 0
                              ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                              : "border-rose-500/20 bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {avail > 0 ? `${avail} avail` : "Out of stock"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                          {item.status || "approved"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full",
                            )}
                          >
                            <Pencil className="mr-1 size-3.5" />
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(item._id)}
                            className={cn(
                              buttonVariants({
                                variant: "destructive",
                                size: "sm",
                              }),
                              "rounded-full",
                            )}
                          >
                            {isDeleting ? (
                              <IOSSpinner size={14} />
                            ) : (
                              <>
                                <Trash2 className="mr-1 size-3.5" />
                                Delete
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

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="glass w-full max-w-lg rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Edit Equipment
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Category
                  </label>
                  <input
                    required
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Location
                  </label>
                  <input
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Rate ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Rental Type
                  </label>
                  <select
                    value={editForm.rentalType}
                    onChange={(e) =>
                      setEditForm({ ...editForm, rentalType: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Available Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editForm.availableQuantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        availableQuantity: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Image URL
                </label>
                <input
                  value={editForm.image}
                  onChange={(e) =>
                    setEditForm({ ...editForm, image: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-foreground focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full",
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className={cn(
                    buttonVariants(),
                    "shadow-coral rounded-full px-5",
                  )}
                >
                  {savingEdit ? <IOSSpinner size={16} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}