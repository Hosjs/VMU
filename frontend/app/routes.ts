import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("layouts/MainLayout.tsx", [

  ]),
] satisfies RouteConfig;
