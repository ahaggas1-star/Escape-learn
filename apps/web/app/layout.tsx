import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "قِيَم — منصة القيم الأسرية",
  description:
    "منصة أسرية تحوّل القيم التربوية إلى أهداف ومهام عملية مع تلعيب آمن.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4d3d60",
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
      </body>
    </html>
  );
}
