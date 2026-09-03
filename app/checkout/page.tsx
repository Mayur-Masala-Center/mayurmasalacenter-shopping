import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Mayur Masala and Pooja Center",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
