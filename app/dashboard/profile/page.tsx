"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  Mail,
  MapPin,
  Phone,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { updateUser, useSession } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ProfileData = {
  name: string;
  image: string;
  phone: string;
  address: string;
};

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [initial, setInitial] = useState<ProfileData>({
    name: "",
    image: "",
    phone: "",
    address: "",
  });
  const [form, setForm] = useState<ProfileData>({
    name: "",
    image: "",
    phone: "",
    address: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadProfile() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/auth/me`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const u = data.user;
          const loaded: ProfileData = {
            name: u?.name || user?.name || "",
            image: u?.image || user?.image || "",
            phone: u?.phone || "",
            address: u?.address || "",
          };
          if (!cancelled) {
            setInitial(loaded);
            setForm(loaded);
          }
        } else if (!cancelled) {
          const fallback: ProfileData = {
            name: user?.name || "",
            image: user?.image || "",
            phone: "",
            address: "",
          };
          setInitial(fallback);
          setForm(fallback);
        }
      } catch {
        if (!cancelled) {
          const fallback: ProfileData = {
            name: user?.name || "",
            image: user?.image || "",
            phone: "",
            address: "",
          };
          setInitial(fallback);
          setForm(fallback);
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isPending || !user || loadingProfile) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IOSSpinner size={32} className="text-foreground/80" />
      </div>
    );
  }

  const initials = (form.name || user.name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasChanges =
    form.name.trim() !== initial.name ||
    form.image.trim() !== initial.image ||
    form.phone.trim() !== initial.phone ||
    form.address.trim() !== initial.address;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const authHeaders = await getAuthHeaders();

      // 1. Save full profile (including phone & address) in Express / MongoDB
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name.trim(),
          image: form.image.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update profile.");
      }

      // 2. Sync name & image with BetterAuth session
      await updateUser({
        name: form.name.trim(),
        image: form.image.trim() || undefined,
      });

      const updated: ProfileData = {
        name: form.name.trim(),
        image: form.image.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      setInitial(updated);
      setForm(updated);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and update your personal details across Apex Rentals.
        </p>
      </div>

      {/* Identity summary card */}
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-muted/30 p-5 sm:flex-row sm:items-center">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-primary/15 ring-2 ring-border">
          {form.image && !imgError ? (
            <Image
              src={form.image}
              alt={form.name || "User avatar"}
              width={64}
              height={64}
              unoptimized
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="size-full object-cover"
            />
          ) : (
            <div className="grid size-full place-items-center text-lg font-semibold text-coral-text">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {form.name || user.name}
            </h2>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium capitalize text-coral-text">
              {user.role || "Customer"}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      {/* Edit form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-muted/20 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-sm">
              <UserIcon className="size-3.5 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              className="h-10 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm">
              <Phone className="size-3.5 text-muted-foreground" />
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center gap-2 text-sm">
            <MapPin className="size-3.5 text-muted-foreground" />
            Address
          </Label>
          <Input
            id="address"
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street, Area, City"
            className="h-10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image" className="flex items-center gap-2 text-sm">
            <Camera className="size-3.5 text-muted-foreground" />
            Profile Image URL
          </Label>
          <Input
            id="image"
            type="url"
            value={form.image}
            onChange={(e) => {
              setForm({ ...form, image: e.target.value });
              setImgError(false);
            }}
            placeholder="https://example.com/avatar.jpg"
            className="h-10 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="size-3.5" />
              Email Address
            </Label>
            <Input
              value={user.email}
              disabled
              className="h-10 rounded-xl opacity-70"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5" />
              Account Role
            </Label>
            <Input
              value={(user.role || "Customer").toUpperCase()}
              disabled
              className="h-10 rounded-xl opacity-70"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving || !hasChanges}
            className="shadow-coral h-10 rounded-full px-6"
          >
            {saving ? (
              "Saving..."
            ) : (
              <>
                <Check className="mr-1.5 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}