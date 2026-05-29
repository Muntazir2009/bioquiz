import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Tell OpenNext to externalize Prisma's native engine
  // so it doesn't try to bundle it (which causes fs.readdir errors)
  wrapper: {
    external: [
      "@prisma/client/scripts/default-index.js",
      ".prisma/client/scripts/default-index.js",
    ],
  },
});
