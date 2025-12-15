import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-gray-600">The page you are looking for does not exist.</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
