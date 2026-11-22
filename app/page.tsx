import { Hero } from "@/components/Home/Hero/page";
import { Categories } from "@/components/Home/Categories/page";
import { Features } from "@/components/Home/Features/page";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs/page";
import { HowItWorks } from "@/components/Home/How It Works/page";
import { CustomerReview } from "@/components/Home/CustomerReview/page";
import type { Equipment } from "@/lib/equipment";
import TrustedOwners from "@/components/Home/TrustedOwners/page";

async function getFeaturedEquipment(): Promise<Equipment[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const res = await fetch(`${apiUrl}/equipment/featured`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
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

export default async function Home() {
  const items = await getFeaturedEquipment();

  return (
    <>
      <Hero />
      <Features items={items} />
      <Categories />
      <WhyChooseUs />
      <HowItWorks />
      <TrustedOwners/>
      <CustomerReview />
    </>
  );
}