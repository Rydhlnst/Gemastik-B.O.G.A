import "./globals.css";
import Navbar from "@/components/ui/navbar";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import MainWrapper from "@/components/ui/main-wrapper";

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
    <html lang="en">
      <body className="min-h-screen flex flex-col relative font-sans antialiased text-gray-900 bg-white">
        <Providers>
          <Navbar />
          <MainWrapper>{children}</MainWrapper>
        </Providers>
        <Toaster position="bottom-right" visibleToasts={3} richColors />
      </body>
    </html>
  );
}
