import { Outlet, Link, Form } from "react-router";
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
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
    <CopilotKit publicApiKey={import.meta.env.VITE_COPILOT_CLOUD_PUBLIC_API_KEY}>
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              to="/"
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
            <Form method="post" action="/admin/logout">
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
    <CopilotPopup
      instructions="You are a form builder assistant. You help users add, edit, and delete form fields via chat. Available field types: text, number, textarea. Each field has a label, placeholder, required flag, and type-specific options. When the user asks to add a field, use the addField action. When they ask to change a field, use updateField. When they ask to remove a field, use deleteField. Respond in the same language the user writes in."
      labels={{
        title: "AI Assistant",
        initial: "Describe what fields to add, e.g. 'Add a required phone field'",
      }}
    />
    </CopilotKit>
  );
}
