import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services/standards",
        destination: "/master-data/standards",
        permanent: true,
      },
      {
        source: "/services/standards/:id",
        destination: "/master-data/standards/:id",
        permanent: true,
      },
      {
        source: "/services/test-methods",
        destination: "/master-data/test-methods",
        permanent: true,
      },
      {
        source: "/services/test-methods/:id",
        destination: "/master-data/test-methods/:id",
        permanent: true,
      },
      {
        source: "/services/sample-classes",
        destination: "/master-data/sample-classes",
        permanent: true,
      },
      {
        source: "/services/sample-classes/:id",
        destination: "/master-data/sample-classes/:id",
        permanent: true,
      },
      {
        source: "/master",
        destination: "/master-data",
        permanent: true,
      },
      {
        source: "/master/:path*",
        destination: "/master-data/:path*",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "getlab",
  project: "gims",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,

  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
