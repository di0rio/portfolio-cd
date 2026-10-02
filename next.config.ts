import type { NextConfig } from "next";
import { withInternationalization } from "better-intl/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
    ],
  },
};

export default withInternationalization(nextConfig);
