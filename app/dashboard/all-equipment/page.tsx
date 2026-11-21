"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ExternalLink,
  Layers,
  Pencil,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { buildEquipmentUrl } from "@/lib/slug";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AdminEquipmentItem = {
  _id: string;
  name: string;
  category?: string;
  location?: string;
  rentalType?: string;
  price?: number;
  availableQuantity?: number;
  ownerEmail?: string;
  status?: string;
  image?: string;
  description?: string;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "approved") {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  }
  if (s === "pending") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  return "bg-rose-500/15 text-rose-400 border-rose-500/20";
}

export default function AllEquipmentAdminPage() {
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<AdminEquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminEquipmentItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    location: "",
    price: "",
    availableQuantity: "",
    status: "approved",
  });

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadAllEquipment() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/admin/equipment`, {
          headers,
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load equipment");
        }

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

    loadAllEquipment();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  async function handleStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/equipment/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item)),
      );
      toast.success(`Equipment ${status}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/equipment/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete equipment");
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success("Equipment deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete equipment",
      );
    } finally {
      setBusyId(null);
    }
  }

  function openEdit(item: AdminEquipmentItem) {
    setEditing(item);
    setEditForm({
      name: item.name || "",
      category: item.category || "",
      location: item.location || "",
      price: String(item.price ?? 0),
      availableQuantity: String(item.availableQuantity ?? 0),
      status: String(item.status || "pending").toLowerCase(),
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/equipment/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          location: editForm.location,
          price: Number(editForm.price),
          availableQuantity: Number(editForm.availableQuantity),
          status: editForm.status,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update equipment");
      }

      setItems((prev) =>
        prev.map((row) =>
          row._id === editing._id
            ? {
                ...row,
                ...editForm,
                price: Number(editForm.price),
                availableQuantity: Number(editForm.availableQuantity),
              }
            : row,
        ),
      );
      toast.success("Equipment updated.");
      setEditing(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update equipment",
      );
    } finally {
      setSavingEdit(false);
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
          All Equipment
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve, reject, edit, or delete equipment listings across the
          platform.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <Layers className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No equipment found
          </h2>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">Equipment</th>
                  <th className="px-4 py-3.5">Owner</th>
                  <th className="px-4 py-3.5">Rate</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.map((item) => {
                  const st = String(item.status || "pending").toLowerCase();
                  const unit = (item.rentalType || "Daily")
                    .toLowerCase()
                    .replace(/ly$/, "");
                  const isBusy = busyId === item._id;

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
                              href={buildEquipmentUrl(item)}
                              className="inline-flex items-center gap-1 font-medium text-foreground hover:text-coral-text hover:underline"
                            >
                              <span className="max-w-[210px] truncate">
                                {item.name}
                              </span>
                              <ExternalLink className="size-3.5 shrink-0 opacity-60" />
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {item.category || "General"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {item.ownerEmail || "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-foreground">
                        ${Number(item.price ?? 0).toFixed(2)}{" "}
                        <span className="text-xs font-normal capitalize text-muted-foreground">
                          / {unit || "day"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadge(
                            st,
                          )}`}
                        >
                          {st}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy || st === "approved"}
                            onClick={() => handleStatus(item._id, "approved")}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full text-emerald-400 hover:text-emerald-300",
                            )}
                          >
                            <CheckCircle2 className="mr-1 size-3.5" />
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={isBusy || st === "rejected"}
                            onClick={() => handleStatus(item._id, "rejected")}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full text-amber-400 hover:text-amber-300",
                            )}
                          >
                            <XCircle className="mr-1 size-3.5" />
                            Reject
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEdit(item)}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-full",
                            )}
                          >
                            <Pencil className="mr-1 size-3.5" />
                            Update
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(item._id)}
                            className={cn(
                              buttonVariants({
                                variant: "destructive",
                                size: "sm",
                              }),
                              "rounded-full",
                            )}
                          >
                            {isBusy ? (
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

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="glass w-full max-w-lg rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Update Equipment
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
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
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground focus:outline-none"
                  >
                    <option
                      value="pending"
                      className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                    >
                      Pending
                    </option>
                    <option
                      value="approved"
                      className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                    >
                      Approved
                    </option>
                    <option
                      value="rejected"
                      className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                    >
                      Rejected
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
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