import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "قِيَم — منصة القيم الأسرية",
  description:
    "منصة أسرية تحوّل القيم التربوية إلى أهداف ومهام عملية مع تلعيب آمن.",
  icons: { icon: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "قِيَم" },
};

export const viewport: Viewport = {
  themeColor: "#4d3d60",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
