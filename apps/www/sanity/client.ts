import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "13jolr5q",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
});