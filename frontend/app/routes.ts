import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/LandingPage.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  layout("layouts/MainLayout.tsx", [
    route("dashboard", "layouts/dashboard/Dashboard.tsx"),

    //system route
    route("users/profile", "routes/users/profiles.tsx"),
    route("users/roles", "routes/users/role-management.tsx"),
    route("users/user-managements", "routes/users/user-managements.tsx"),

    //student routes
    route("students", "routes/student/students.tsx"),
    route("class-management", "routes/student/classes/classes.tsx"),
    route("subject-management", "routes/student/subject-management.tsx"),

    //lecturer routes
    route("lecturers", "routes/lecturer/lecturers.tsx"),
    route("lecturer/class-students/:classId", "routes/lecturer/class-students.$classId.tsx"),
    route("lecturer/schedule", "routes/lecturer/teaching-schedule.tsx"),

    //training routes
    route("training/course-registrations", "routes/training/course-registrations.tsx"),
    route("training/study-plans", "routes/training/study-plans.tsx"),

    //categories routes
    route("majors", "routes/categories/majors.tsx"),
    route("education_levels", "routes/categories/education-level.tsx"),
    route("courses", "routes/categories/course.tsx"),

    //report routes
    route("/reports/dashboard", "routes/report.tsx"),

    //setting routes
    route("/admin/settings", "routes/setting.tsx"),

    //academic routes
    route("academic/grades", "routes/academic/grades.tsx"),
  ]),
] satisfies RouteConfig;
