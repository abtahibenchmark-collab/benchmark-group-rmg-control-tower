import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Benchmark Group | RMG Control Tower",
  description: "Order, material, production, FG and shipment management for RMG."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
