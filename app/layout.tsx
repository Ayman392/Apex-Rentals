import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Navbar } from "@/components/Navbar/page";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Apex Rentals | Rent Professional Equipment",
    template: "%s | Apex Rentals",
  },
  description:
    "Rent construction, photography, agriculture, event and more equipment from verified owners. Flexible periods, secure payments.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen font-sans antialiased">
        <TooltipProvider>
  <Navbar />
  {children}
</TooltipProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}