import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Listify — Local Beauty Industry Marketplace",
  description:
    "Connect talented barbers, cosmetologists, and tattoo artists with shops in San Diego County.",
  keywords: [
    "barber jobs",
    "cosmetologist jobs",
    "tattoo artist jobs",
    "beauty industry",
    "San Diego",
    "chair rental",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    // Not authenticated
  }

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="font-display antialiased bg-bg-base text-text-primary min-h-dvh">
        <ToastProvider>
          <Header user={user} />
          {children}
          {user && <BottomNav role={user.role} />}
        </ToastProvider>
      </body>
    </html>
  );
}
