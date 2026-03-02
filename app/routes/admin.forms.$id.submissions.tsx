import { Link, useLoaderData } from "react-router";
import { createServerCaller } from "~/server/caller";

export async function loader({
  params,
  request,
}: {
  params: { id: string };
  request: Request;
}) {
  const caller = await createServerCaller(request);
  const [form, submissions] = await Promise.all([
    caller.form.getById({ id: params.id }),
    caller.submission.listByForm({ formId: params.id }),
  ]);
  return { form, submissions };
}

export function meta({
  data,
}: {
  data: { form: { title: string } } | undefined;
}) {
  return [
    {
      title: data ? `Submissions: ${data.form.title}` : "Submissions",
    },
  ];
}

export default function AdminFormSubmissions() {
  const { form, submissions } = useLoaderData<typeof loader>();
  const fieldLabels = Object.fromEntries(
    form.fields.map((f) => [f.id, f.label]),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/admin"
            className="mb-2 block text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to forms
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Submissions: {form.title}
          </h1>
        </div>
        <Link
          to={`/admin/forms/${form.id}/edit`}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Edit form
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
          No submissions yet.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="mb-3 text-xs text-gray-500">
                {new Date(sub.createdAt).toLocaleString()}
              </p>
              <dl className="space-y-2">
                {Object.entries(sub.data as Record<string, unknown>).map(
                  ([fieldId, value]) => (
                    <div key={fieldId}>
                      <dt className="text-xs font-medium text-gray-500">
                        {fieldLabels[fieldId] ?? fieldId}
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {String(value ?? "—")}
                      </dd>
                    </div>
                  ),
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
