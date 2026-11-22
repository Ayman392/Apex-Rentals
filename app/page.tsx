import { Suspense } from "react";
import { Hero } from "@/components/Home/Hero/page";
import { Categories } from "@/components/Home/Categories/page";
import { Features } from "@/components/Home/Features/page";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs/page";
import { HowItWorks } from "@/components/Home/How It Works/page";
import { CustomerReview } from "@/components/Home/CustomerReview/page";
import TrustedOwners from "@/components/Home/TrustedOwners/page";
import type { Equipment } from "@/lib/equipment";

export const revalidate = 60;

async function getFeaturedEquipment(): Promise<Equipment[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const res = await fetch(`${apiUrl}/equipment/featured`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];

    const data: unknown = await res.json();
    if (Array.isArray(data)) return data as Equipment[];
    if (
      data &&
      typeof data === "object" &&
      "items" in data &&
      Array.isArray((data as { items: unknown }).items)
    ) {
      return (data as { items: Equipment[] }).items;
    }
    return [];
  } catch {
    return [];
  }
}

async function FeaturedSection() {
  const items = await getFeaturedEquipment();
  return <Features items={items} />;
}

function FeaturedSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="h-[420px] w-full animate-pulse rounded-3xl bg-white/5" />
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<FeaturedSkeleton />}>
        <FeaturedSection />
      </Suspense>
      <Categories />
      <WhyChooseUs />
      <HowItWorks />
      <TrustedOwners />
      <CustomerReview />
    </>
  );
}