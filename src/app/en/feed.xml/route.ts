import { blogFeed } from "@/lib/feed";

export const revalidate = 3600;

export const GET = () => blogFeed("en");
