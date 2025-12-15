/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@thinkthroo/lesson'],
    typescript: {
        ignoreBuildErrors: true,
    },
    async redirects() {
        return [
          {
            source: "/",
            destination: "/architecture",
            permanent: true,
          },
        ];
      },
};
  
export default nextConfig;
  