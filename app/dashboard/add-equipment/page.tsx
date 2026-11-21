"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { useSession } from "@/lib/auth-client";
import { uploadToImgbb } from "@/lib/imgbb";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Cameras & Optics",
  "Construction & Heavy",
  "Agriculture",
  "Electronics & IT",
  "Audio & Lighting",
  "Power & Generators",
  "Tools & Workshop",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

export default function AddEquipmentPage() {
  const router = useRouter();
  const { isPending } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    condition: "Good",
    category: CATEGORIES[0],
    location: "",
    rentalType: "Daily",
    price: "",
    totalQuantity: "1",
    availableQuantity: "1",
    image: "",
    termsAndConditions: "",
    description: "",
  });

  async function handleImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadToImgbb(file);
      setForm((prev) => ({ ...prev, image: url }));
      toast.success("Image uploaded to imgbb.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image.",
      );
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uploadingImage) {
      toast.error("Please wait for the image upload to finish.");
      return;
    }

    setSubmitting(true);

    try {
      const headers = await getAuthHeaders();
      const totalQty = Math.max(Number(form.totalQuantity) || 1, 1);
      const availQty = Math.min(
        Math.max(Number(form.availableQuantity) || 0, 0),
        totalQty,
      );

      const res = await fetch(`${API_URL}/equipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          brand: form.brand,
          model: form.model,
          condition: form.condition,
          category: form.category,
          location: form.location,
          rentalType: form.rentalType,
          price: Number(form.price),
          totalQuantity: totalQty,
          availableQuantity: availQty,
          image: form.image,
          termsAndConditions: form.termsAndConditions,
          description: form.description,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to publish equipment");
      }

      toast.success("Equipment submitted for approval (Pending).");
      router.push("/dashboard/my-equipment");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to publish equipment",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <IOSSpinner size={32} className="text-foreground/80" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Add Equipment
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit a new rental listing for admin approval (starts as Pending).
          </p>
        </div>

        <Link
          href="/dashboard/my-equipment"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-fit rounded-full",
          )}
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Back to My Equipment
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-muted/20 p-6 text-sm sm:p-8"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Equipment Name *
            </label>
            <input
              required
              placeholder="e.g. Sony FX6 Full-Frame Cinema Camera"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Brand *
            </label>
            <input
              required
              placeholder="e.g. Sony"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Model *
            </label>
            <input
              required
              placeholder="e.g. ILME-FX6"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Equipment Condition *
            </label>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              {CONDITIONS.map((cond) => (
                <option
                  key={cond}
                  value={cond}
                  className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
                >
                  {cond}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Pickup / Storage Location *
            </label>
            <input
              required
              placeholder="e.g. Mirpur, Dhaka"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Rental Rate ($) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              required
              placeholder="150"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Billing Cycle
            </label>
            <select
              value={form.rentalType}
              onChange={(e) => setForm({ ...form, rentalType: e.target.value })}
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
            >
              <option
                value="Daily"
                className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
              >
                Daily
              </option>
              <option
                value="Weekly"
                className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
              >
                Weekly
              </option>
              <option
                value="Monthly"
                className="bg-popover text-popover-foreground dark:bg-[#111827] dark:text-slate-100"
              >
                Monthly
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Total Units
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.totalQuantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  totalQuantity: e.target.value,
                  availableQuantity: e.target.value,
                })
              }
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Available Now
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.availableQuantity}
              onChange={(e) =>
                setForm({ ...form, availableQuantity: e.target.value })
              }
              className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Image Upload via imgbb */}
        <div className="space-y-2.5">
          <label className="block text-xs font-medium text-muted-foreground">
            Equipment Image (Upload via imgbb) *
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-xs font-medium text-foreground transition hover:border-primary">
              <Upload className="size-4 text-primary" />
              <span>
                {uploadingImage ? "Uploading to imgbb..." : "Choose Image File"}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>

            {uploadingImage && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IOSSpinner size={16} />
                Uploading image...
              </div>
            )}
          </div>

          {form.image && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-2.5">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={form.image}
                  alt="Uploaded equipment preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <span className="truncate text-xs text-muted-foreground">
                {form.image}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Description & Included Accessories
          </label>
          <textarea
            rows={3}
            placeholder="Describe key specifications, included batteries/cables, and pickup notes..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Rental Terms and Conditions
          </label>
          <textarea
            rows={3}
            placeholder="Specify return conditions, security/damage rules, and late return terms..."
            value={form.termsAndConditions}
            onChange={(e) =>
              setForm({ ...form, termsAndConditions: e.target.value })
            }
            className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {submitting && <IOSSpinner size={18} className="text-foreground/80" />}
          <InteractiveHoverButton
            type="submit"
            disabled={submitting || uploadingImage}
            text={submitting ? "Publishing..." : "Publish Equipment"}
            className="h-11 w-52"
          />
        </div>
      </form>
    </div>
  );
}