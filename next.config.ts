import type { NextConfig } from "next";
import { withInternationalization } from "better-intl/next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      // github.com/<user>.png redireciona pra cá (avatar do perfil).
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default withInternationalization(nextConfig);
