// Pin the Cloudflare Workers compatibility date instead of letting Nitro write
// the current date into the generated wrangler config on every build.
export default {
  compatibilityDate: "2025-07-13",
};
