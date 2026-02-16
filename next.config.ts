import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow dev server requests from ngrok (and similar) so cookies/auth work when using tunnel
  allowedDevOrigins: ["meda-stickiest-underisively.ngrok-free.dev"],
};

export default nextConfig;
