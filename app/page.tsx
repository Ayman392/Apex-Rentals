import { Hero } from "@/components/Home/Hero/page";
import { Features } from "@/components/Home/Features/page";
import { getFeaturedEquipment } from "@/lib/equipment";
import { Categories } from "@/components/Home/Categories/page";

export default async function Home() {
  const featured = await getFeaturedEquipment();

  return (
    <>
      <Hero />
      <Features items={featured} />
      <Categories/>
    </>
  );
}