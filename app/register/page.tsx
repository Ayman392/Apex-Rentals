"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Image as ImageIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Upload,
  Loader2,
} from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { uploadToImgbb } from "@/lib/imgbb";

export default function RegisterPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState<"Customer" | "Owner">("Customer");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasMinLen = password.length >= 6;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadToImgbb(file);
      setImage(url);
      setImageError(false);
      toast.success("Photo uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasMinLen) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!hasUpper) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }
    if (!hasLower) {
      toast.error("Password must contain at least one lowercase letter.");
      return;
    }

    setLoading(true);
    const { error } = await signUp.email({
      name,
      email,
      password,
      image: image.trim() || undefined,
      role,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Registration failed.");
      return;
    }

    toast.success("Account created! Welcome to Apex Rentals.");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-8">
      <div className="glass w-full max-w-[420px] rounded-[24px] p-6 text-card-foreground sm:p-7">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Join Apex Rentals to rent or list equipment.
          </p>
        </div>

        {/* Live Profile Photo Preview (clickable to upload) */}
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Upload profile photo"
            className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground ring-4 ring-primary/15 transition hover:opacity-90 disabled:opacity-70"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : image.trim() && !imageError ? (
              <Image
                src={image}
                alt="Profile preview"
                width={56}
                height={56}
                unoptimized
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <User className="h-6 w-6" strokeWidth={1.75} />
            )}
          </button>
          <span className="mt-1.5 text-[11px] text-muted-foreground">
            {uploading ? "Uploading photo..." : "Profile photo preview"}
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label htmlFor="name" className="block text-xs font-medium text-foreground">
              Full name
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3.5 py-2 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-xs font-medium text-foreground">
              Email address
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3.5 py-2 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Profile Photo URL + ImgBB Upload */}
          <div className="space-y-1">
            <label htmlFor="image" className="block text-xs font-medium text-foreground">
              Profile photo
            </label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3.5 py-2 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
                <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="image"
                  type="url"
                  placeholder="Paste URL or upload"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImageError(false);
                  }}
                  required
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-input bg-muted/70 px-3 py-2 text-xs font-medium text-foreground transition hover:border-primary/50 hover:bg-muted disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* Account Type (Customer / Owner) */}
          <div className="space-y-1">
            <span className="block text-xs font-medium text-foreground">
              Account type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(["Customer", "Owner"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  className={`rounded-full border py-1.5 text-xs font-medium transition ${
                    role === option
                      ? "border-primary bg-primary text-primary-foreground shadow-coral"
                      : "border-input bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-xs font-medium text-foreground">
              Password
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-input bg-muted/50 px-3.5 py-2 transition focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Live Password Checklist */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] leading-tight">
              <div
                className={`flex items-center gap-1 ${
                  hasUpper ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {hasUpper ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                <span>Uppercase</span>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  hasLower ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {hasLower ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                <span>Lowercase</span>
              </div>
              <div
                className={`flex items-center gap-1 ${
                  hasMinLen ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {hasMinLen ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                ) : (
                  <Circle className="h-3 w-3 shrink-0" />
                )}
                <span>6+ chars</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="shadow-coral mt-1 flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {/* Footer Link */}
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-coral-text hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}