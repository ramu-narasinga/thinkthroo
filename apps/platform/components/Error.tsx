interface ErrorCaptureProps {
  error: Error;
  reset: () => void;
}

export default function ErrorCapture({ error, reset }: ErrorCaptureProps) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-[#7000FF] px-4 py-2 text-white hover:bg-[#7000FF]/90"
      >
        Try again
      </button>
    </div>
  );
}
