import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";
import { Navbar } from "@/components/Home/Navbar/page";
import { ConditionalFooter } from "@/components/Home/Footer/conditional-footer";

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
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <SmoothScroll />
        <ThemeProvider>
          <TooltipProvider>
            <Navbar />
            {children}
            <ConditionalFooter />
          </TooltipProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}