"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string | null;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function roleBadge(role: string) {
  const normalized = role.toLowerCase();
  if (normalized === "admin") {
    return "bg-rose-500/15 text-rose-400 border-rose-500/20";
  }
  if (normalized === "owner") {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  return "bg-sky-500/15 text-sky-400 border-sky-500/20";
}

export default function AllUsersPage() {
  const { data: session, isPending } = useSession();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadUsers() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/admin/users`, {
          headers,
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Failed to load users");
        }

        if (!cancelled) {
          setUsers(Array.isArray(data.users) ? data.users : []);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load users",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      cancelled = true;
    };
  }, [session?.user]);

  async function handleRoleChange(userId: string, nextRole: string) {
    setUpdatingId(userId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ role: nextRole }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
      }

      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u)),
      );
      toast.success(`Role updated to ${nextRole}.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update role",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    setDeletingId(userId);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success("User removed.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete user",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  if (isPending || loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IOSSpinner size={32} className="text-foreground/80" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            All Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View registered accounts and manage Customer, Owner, and Admin
            roles.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-muted/40 py-2 pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-6 py-16 text-center">
          <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15 text-coral-text">
            <Users className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            No matching users found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing your search filter or check registered accounts.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-muted/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5 text-center">Role</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.map((user) => {
                  const isBusy =
                    updatingId === user._id || deletingId === user._id;
                  const currentRole = user.role.toLowerCase();

                  return (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{user.name}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {user.email}
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${roleBadge(
                            currentRole,
                          )}`}
                        >
                          {currentRole}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <select
                            disabled={isBusy}
                            value={currentRole}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium capitalize text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                          >
                            <option
                              value="customer"
                              className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                            >
                              Customer
                            </option>
                            <option
                              value="owner"
                              className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                            >
                              Owner
                            </option>
                            <option
                              value="admin"
                              className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                            >
                              Admin
                            </option>
                          </select>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDeleteUser(user._id)}
                            className={cn(
                              buttonVariants({
                                variant: "destructive",
                                size: "sm",
                              }),
                              "rounded-full",
                            )}
                          >
                            {deletingId === user._id ? (
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
    </div>
  );
}