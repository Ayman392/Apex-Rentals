import { Hero } from "@/components/Home/Hero/page";
import { Features } from "@/components/Home/Features/page";
import { getFeaturedEquipment } from "@/lib/equipment";

export default async function Home() {
  const featured = await getFeaturedEquipment();

  return (
    <>
      <Hero />
      <Features items={featured} />
    </>
  );
}