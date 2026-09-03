import type { Metadata } from "next";
import TrackClient from "./TrackClient";

export const metadata: Metadata = {
  title: "Track Your Order | Mayur Masala and Pooja Center",
  description:
    "Track your Mayur Masala and Pooja Center order by tracking link, order ID, or phone number.",
};

export default function TrackLookupPage() {
  return <TrackClient />;
}
