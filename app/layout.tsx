import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/client/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vicharcha",
  description: "A multilingual social platform",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "white" },
  { media: "(prefers-color-scheme: dark)", color: "black" },
]

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
