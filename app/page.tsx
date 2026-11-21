import { Hero } from "@/components/Home/Hero/page";

import { Categories } from "@/components/Home/Categories/page";
import { Features } from "@/components/Home/Features/page";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs/page";
import CustomerReview from "@/components/Home/CutomerReview/page";
import { HowItWorks } from "@/components/Home/How It Works/page";

export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment/featured`, {
    cache: "no-store",
  });
  const items = res.ok ? await res.json() : [];

  return (
    <>
      <Hero />
      <Features items={items} />
      <Categories />
      <WhyChooseUs/>
      <HowItWorks/>
      <CustomerReview/>
    </>
  );
}