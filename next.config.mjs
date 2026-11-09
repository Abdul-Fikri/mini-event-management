/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let storageRemotePattern = [];
try {
  if (supabaseUrl) {
    const url = new URL(supabaseUrl);
    storageRemotePattern = [{
      protocol: url.protocol.slice(0, -1),
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/storage/v1/object/public/group-logos/**",
    }];
  }
} catch {
  console.warn("NEXT_PUBLIC_SUPABASE_URL is not a valid URL; remote group logos are disabled.");
}

const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  images: { remotePatterns: storageRemotePattern },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
