import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import MainWrapper from "@/components/ui/main-wrapper";
import BootOverlay from "@/components/ui/boot-overlay";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "B.O.G.A - End-to-End Supply Chain Solutions",
  description: "End-to-End Supply Chain Solutions, Built for Scale",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakartaSans.variable}>
      <body className="min-h-screen flex flex-col relative font-sans antialiased bg-background text-foreground">
        <Providers>
          <BootOverlay />
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
        </Providers>
        <Toaster position="bottom-right" visibleToasts={3} richColors />
      </body>
    </html>
  );
}
