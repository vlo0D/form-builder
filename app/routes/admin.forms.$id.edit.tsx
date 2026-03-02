import { useLoaderData } from "react-router";
import { createServerCaller } from "~/server/caller";
import { FormEditor } from "~/components/FormEditor";
import type { EditableField } from "~/components/FieldSettingsSidebar";
import type { FieldType } from "~/lib/validation";

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

export function meta({
  data,
}: {
  data: { form: { title: string } } | undefined;
}) {
  return [{ title: data ? `Edit: ${data.form.title}` : "Edit Form" }];
}

export default function AdminFormsEdit() {
  const { form } = useLoaderData<typeof loader>();

  const initialFields: EditableField[] = form.fields.map((f) => ({
    clientId: f.id,
    type: f.type as FieldType,
    label: f.label,
    placeholder: f.placeholder ?? "",
    required: f.required,
    options: f.options as Record<string, unknown>,
    order: f.order,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Edit: {form.title}
      </h1>
      <FormEditor
        formId={form.id}
        initialTitle={form.title}
        initialDescription={form.description ?? ""}
        initialFields={initialFields}
      />
    </div>
  );
}
