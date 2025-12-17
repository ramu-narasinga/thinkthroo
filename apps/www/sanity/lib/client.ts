import { createClient } from "next-sanity";
import "@/sanity/types";

import { apiVersion, dataset, projectId } from "@/sanity/env";

const base = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const isProduction = process.env.NODE_ENV === 'production';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Use CDN in production for better performance and fewer API calls
  useCdn: isProduction,
  // Disable stega in production to reduce overhead
  stega: isProduction ? undefined : { studioUrl: process.env.STUDIO_URL ?? `${base}/studio` },
});
