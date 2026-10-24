import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3+ writes AGENTS.md when `next dev` detects an AI agent; off, as in apps/forex.
  agentRules: false,
};

export default nextConfig;
