import type { Metadata } from "next";
import { ThemeProvider } from "@wrksz/themes/next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueueZero - Know Before You Go",
  description:
    "Real-time crowdsourced queue intelligence & wait-time prediction for hospitals, government offices, banks, and more.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen flex flex-col antialiased bg-[#fffefc] text-[#222222] selection:bg-[#e1f4df] selection:text-[#0f3e17]">
          <ThemeProvider defaultTheme="light">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
