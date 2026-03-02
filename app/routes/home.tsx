import { Link, useLoaderData } from "react-router";
import { createServerCaller } from "~/server/caller";

export async function loader({ request }: { request: Request }) {
  const caller = await createServerCaller(request);
  const forms = await caller.form.listPublished();
  return { forms };
}

export function meta() {
  return [
    { title: "Form Builder" },
    { name: "description", content: "Fill out published forms" },
  ];
}

export default function Home() {
  const { forms } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Form Builder</h1>
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Admin Login
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Available Forms
        </h2>

        {forms.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
            No published forms yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <Link
                key={form.id}
                to={`/forms/${form.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {form.title}
                </h3>
                {form.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {form.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  {form.fields.length} field
                  {form.fields.length !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
