import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Call booked | Think Throo",
  robots: { index: false, follow: false },
};

export default function BookedPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl text-primary">
        ✓
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Call booked.
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        You'll get a calendar invite with a video link. See you then.
      </p>
    </div>
  );
}
