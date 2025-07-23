import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";
const isExport = process.env.OUTPUT_EXPORT === '1';

const nextConfig: NextConfig = {
  basePath: isProd ? "/minecraft-vm-management-console" : "",
  assetPrefix: isProd ? "/minecraft-vm-management-console/" : "",
  reactStrictMode: false,
  ...(isExport ? { output: 'export' } : {})

};


export default nextConfig;
