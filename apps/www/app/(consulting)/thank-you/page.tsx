import type { Metadata } from "next";
import { ThankYouClient } from "@/components/interfaces/consulting/thank-you-client";

export const metadata: Metadata = {
  title: "Thanks | Think Throo",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouClient />;
}
