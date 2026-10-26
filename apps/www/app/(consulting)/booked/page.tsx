import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Call booked | Think Throo",
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-2xl font-bold tracking-tight">Call booked.</h1>
      <p className="mt-4 text-muted-foreground">
        You'll get a calendar invite with a video link. See you then.
      </p>
    </div>
  );
}
