import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  async prerender() {
    return ["/", "/lecturer/teaching-payment"];
  },
} satisfies Config;
