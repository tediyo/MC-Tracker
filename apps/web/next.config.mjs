/** @type {import('next').NextConfig} */
const nextConfig = {
  // packages/shared-types ships raw TypeScript (no build step) - transpile
  // it through Next.js's own compiler rather than requiring the workspace
  // package to pre-build itself.
  transpilePackages: ["@mc-tracker/shared-types"],
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
};

export default nextConfig;
