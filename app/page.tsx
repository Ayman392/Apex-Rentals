import { Hero } from "@/components/Home/Hero/page";

import { Categories } from "@/components/Home/Categories/page";
import { Features } from "@/components/Home/Features/page";
import { WhyChooseUs } from "@/components/Home/WhyChooseUs/page";

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
    </>
  );
}