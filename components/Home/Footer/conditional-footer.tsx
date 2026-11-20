"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Home/Footer/page";

export function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return <Footer />;
}