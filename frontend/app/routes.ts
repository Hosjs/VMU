import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("layouts/MainLayout.tsx", [
    route("dashboard", "layouts/dashboard/Dashboard.tsx"),
    route("profile", "layouts/profile/profile.tsx"),
    //student routes
    route("students", "routes/student/students.tsx"),

    //categories routes
    route("majors", "routes/categories/majors.tsx"),
  ]),
] satisfies RouteConfig;
