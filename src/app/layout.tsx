import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAQET - Packet-Level Proxy Documentation",
  description: "Optimization guide for PAQET, a packet-level proxy with KCP protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
