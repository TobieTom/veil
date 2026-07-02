import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Miden SDK ships a WASM module. It is browser-only (it cannot run under
  // SSR), so we keep it out of the server bundle and enable async WASM loading
  // in the client bundle.
  serverExternalPackages: ["@miden-sdk/miden-sdk"],
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
};

export default nextConfig;
