import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { createServerCaller } from "~/server/caller";
import { FieldRenderer } from "~/components/FieldRenderer";
import { ConfirmModal } from "~/components/ConfirmModal";
import { buildDynamicValidationSchema } from "~/lib/validation";
import { trpc } from "~/lib/trpc";

export async function loader({
  params,
  request,
}: {
  params: { id: string };
  request: Request;
}) {
  const caller = await createServerCaller(request);
  const form = await caller.form.getById({ id: params.id });
  return { form };
}

export function meta({ data }: { data: { form: { title: string } } }) {
  return [{ title: data?.form?.title ?? "Form" }];
}

export default function FormFill() {
  const { form } = useLoaderData<typeof loader>();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const schema = buildDynamicValidationSchema(
      form.fields.map((f) => ({
        ...f,
        options: f.options as Record<string, unknown>,
      })),
    );

    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(
        result.error.flatten().fieldErrors,
      )) {
        if (messages && messages.length > 0) {
          fieldErrors[key] = messages[0];
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setShowModal(true);
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await trpc.submission.create.mutate({
        formId: form.id,
        data: values,
      });
      setSubmitted(true);
      setShowModal(false);
    } catch {
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Form Submitted!
          </h2>
          <p className="mb-6 text-gray-600">
            Your response has been recorded successfully.
          </p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            &larr; Back to forms
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            {form.title}
          </h1>
          {form.description && (
            <p className="mb-6 text-sm text-gray-600">{form.description}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {form.fields.map((field) => (
              <FieldRenderer
                key={field.id}
                field={{
                  ...field,
                  options: field.options as Record<string, unknown>,
                }}
                value={values[field.id] ?? ""}
                onChange={(val) => handleChange(field.id, val)}
                error={errors[field.id]}
              />
            ))}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 focus:outline-none"
            >
              Submit
            </button>
          </form>
        </div>
      </main>

      <ConfirmModal
        open={showModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        loading={submitting}
        data={values}
        fields={form.fields}
      />
    </div>
  );
}
