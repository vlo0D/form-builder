import { Outlet, Link, Form } from "react-router";
import { requireUserId } from "~/server/auth.server";
import { destroyUserSession } from "~/server/auth.server";

export async function loader({ request }: { request: Request }) {
  await requireUserId(request);
  return null;
}

export async function action({ request }: { request: Request }) {
  return destroyUserSession(request);
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              to="/admin"
              className="text-xl font-bold text-gray-900 hover:text-blue-600"
            >
              Form Builder
            </Link>
            <Link
              to="/admin"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              My Forms
            </Link>
            <Link
              to="/admin/forms/new"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Create Form
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              View Public Site
            </Link>
            <Form method="post">
              <button
                type="submit"
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
