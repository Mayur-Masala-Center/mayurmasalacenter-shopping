import type { Metadata } from "next";
import PayClient from "./PayClient";

export const metadata: Metadata = {
  title: "Complete Payment | Mayur Masala and Pooja Center",
  robots: { index: false, follow: false },
};

export default function PayOrderPage() {
  return <PayClient />;
}
