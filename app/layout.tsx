import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Navbar } from "@/components/Home/Navbar/page";
import { Footer } from "@/components/Home/Footer/page";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600"],
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
   <html lang="en" className={`${inter.variable} ${poppins.variable} dark`}>
      <body className="min-h-screen font-sans antialiased">
        <TooltipProvider>
  <Navbar />
  {children}
  <Footer/>
</TooltipProvider>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}