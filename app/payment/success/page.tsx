"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { IOSSpinner } from "@/components/ui/ios-spinner";
import { cn } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getAuthHeaders(): Promise<HeadersInit> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return {};
  const data = await res.json();
  return data?.token ? { Authorization: `Bearer ${data.token}` } : {};
}

type PaymentSummary = {
  equipmentName?: string;
  amount?: number;
  transactionId?: string;
};

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error",
  );
  const [message, setMessage] = useState(
    sessionId ? "" : "Missing Stripe session ID.",
  );
  const [summary, setSummary] = useState<PaymentSummary | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    async function confirm() {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE}/payments/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Could not verify payment.");
        }

        setSummary({
          equipmentName: data.payment?.equipmentName,
          amount: data.payment?.amount,
          transactionId: data.payment?.transactionId,
        });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed.");
      }
    }

    confirm();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4">
        <IOSSpinner size={36} className="text-foreground/80" />
        <p className="text-sm text-muted-foreground">
          Confirming your booking...
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" />
        <h1 className="mt-4 text-xl font-bold text-foreground">
          Payment Verification Failed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Link
          href="/equipment"
          className={cn(buttonVariants(), "shadow-coral mt-6 rounded-full")}
        >
          Back to Equipment
        </Link>
      </div>
    );
  }

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
      <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
      <h1 className="mt-4 text-2xl font-bold text-foreground">
        Booking Confirmed!
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Your payment was successful and your equipment is reserved.
      </p>

      {summary && (
        <div className="mt-6 space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-left text-xs">
          {summary.equipmentName && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Equipment</span>
              <span className="font-medium text-foreground">
                {summary.equipmentName}
              </span>
            </div>
          )}
          {summary.amount !== undefined && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold tabular-nums text-coral-text">
                ${summary.amount}
              </span>
            </div>
          )}
          {summary.transactionId && (
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="truncate font-mono text-[11px] text-foreground">
                {summary.transactionId}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Link
          href="/dashboard/my-rentals"
          className={cn(
            buttonVariants(),
            "shadow-coral h-11 w-full rounded-full sm:flex-1",
          )}
        >
          View My Rentals
          <ArrowRight className="ml-1.5 size-4" />
        </Link>
        <Link
          href="/equipment"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 w-full rounded-full sm:flex-1",
          )}
        >
          Browse More
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-24 pb-12">
      <Suspense fallback={<IOSSpinner size={34} />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}