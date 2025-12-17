import { defineLive } from "next-sanity";
import { client } from "./client";
import { viewerToken } from "@/sanity/env.server";

// Only enable live mode in development to prevent excessive API requests
const isProduction = process.env.NODE_ENV === 'production';

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: "vX",
  }),
  browserToken: isProduction ? undefined : viewerToken,
  serverToken: isProduction ? undefined : viewerToken,
});
