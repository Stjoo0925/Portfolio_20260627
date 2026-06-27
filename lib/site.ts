import { loadSite } from "@/lib/content/load";

/** Backwards-compatible accessor — sourced from content/site.json. */
export const siteConfig = loadSite();
