import { Link, useLoaderData, useRevalidator } from "react-router";
import { createServerCaller } from "~/server/caller";
import { trpc } from "~/lib/trpc";
import { useState } from "react";

export async function loader({ request }: { request: Request }) {
  const caller = await createServerCaller(request);
  const forms = await caller.form.listMy();
  return { forms };
}

export default function AdminIndex() {
  const { forms } = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this form?")) return;
    setDeletingId(id);
    try {
      await trpc.form.delete.mutate({ id });
      revalidate();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
        <Link
          to="/admin/forms/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500">
          No forms yet. Create your first form!
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Fields
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Submissions
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {forms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {form.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {form.fields.length}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {form._count.submissions}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/forms/${form.id}/submissions`}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        View ({form._count.submissions})
                      </Link>
                      <Link
                        to={`/admin/forms/${form.id}/edit`}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        disabled={deletingId === form.id}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
