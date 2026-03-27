import type { Config } from "@react-router/dev/config";

export default {
  // SSR tắt để build thành static files, tương thích với cPanel shared hosting
  ssr: false,
} satisfies Config;
