/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/build-from-scratch",
        destination: "/skills-library",
        permanent: true,
      },
      {
        source: "/build-from-scratch/:path*",
        destination: "/skills-library",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
