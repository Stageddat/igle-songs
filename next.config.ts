import createNextIntlPlugin from "next-intl/plugin";

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
