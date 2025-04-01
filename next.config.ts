import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: isProd ? "/minecraft-vm-management-console" : "",
  assetPrefix: isProd ? "/minecraft-vm-management-console/" : "",
};

export default nextConfig;
