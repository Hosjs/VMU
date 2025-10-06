import type { Config } from "react-router";

export default {
  ssr: true,
  async prerender() {
    return ["/"];
  },
} satisfies Config;

