import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telehealth Platform",
  description: "Secure browser-based telehealth experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
