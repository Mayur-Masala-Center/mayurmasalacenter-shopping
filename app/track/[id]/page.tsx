import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Order Status | Mayur Masala and Pooja Center",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
