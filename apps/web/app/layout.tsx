import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قِيَم — منصة القيم الأسرية",
  description:
    "منصة أسرية تحوّل القيم التربوية إلى أهداف ومهام عملية مع تلعيب آمن.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
