// Settings for a self-hosted copy. Each one can also be given as an environment variable:
//   SITE_URL   public address of the handbook root, e.g. https://example.org/learn-ai
//              Turns on the canonical, hreflang and Open Graph tags; its path becomes the base path.
//   BASE_PATH  path the pages are served under when SITE_URL is not set, e.g. /learn-ai/ (default /)
//   ICP        a Chinese ICP filing number for the footer, if your own site has one
// Links to other pages of the official site (the CS329A companion, the local-models report)
// become absolute links to www.gitechdesign.com, and the footer says this is a self-hosted copy.
export default {
  siteUrl: process.env.SITE_URL || "",
  basePath: process.env.BASE_PATH || "",
  icp: process.env.ICP || "",
  official: false,
};
