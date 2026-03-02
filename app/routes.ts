import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("forms/:id", "routes/forms.$id.tsx"),
  route("login", "routes/login.tsx"),
  route("api/trpc/*", "routes/api.trpc.$.tsx"),

  layout("routes/admin.layout.tsx", [
    route("admin", "routes/admin._index.tsx"),
    route("admin/logout", "routes/admin.logout.tsx"),
    route("admin/forms/new", "routes/admin.forms.new.tsx"),
    route("admin/forms/:id/edit", "routes/admin.forms.$id.edit.tsx"),
    route("admin/forms/:id/submissions", "routes/admin.forms.$id.submissions.tsx"),
  ]),
] satisfies RouteConfig;
