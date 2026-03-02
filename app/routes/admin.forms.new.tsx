import { FormEditor } from "~/components/FormEditor";

export function meta() {
  return [{ title: "Create Form - Admin" }];
}

export default function AdminFormsNew() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Create New Form
      </h1>
      <FormEditor />
    </div>
  );
}
