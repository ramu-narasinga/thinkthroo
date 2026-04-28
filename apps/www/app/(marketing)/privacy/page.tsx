import { notFound } from "next/navigation";
import { fetchPrivacyPolicy } from "@/lib/articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function PrivacyPolicyPage() {
  const doc = await fetchPrivacyPolicy();

  if (!doc) notFound();

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight mb-8">{doc.title}</h1>
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.body}</ReactMarkdown>
      </div>
    </div>
  );
}
