import { FieldRenderer } from "./FieldRenderer";
import type { EditableField } from "./FieldSettingsSidebar";

interface FormPreviewProps {
  title: string;
  description: string;
  fields: EditableField[];
  selectedFieldId: string | null;
  onFieldClick: (clientId: string) => void;
}

export function FormPreview({
  title,
  description,
  fields,
  selectedFieldId,
  onFieldClick,
}: FormPreviewProps) {
  if (fields.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
        <p>Add fields using the buttons above to see a preview</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h2 className="mb-1 text-xl font-bold text-gray-900">{title}</h2>
      )}
      {description && (
        <p className="mb-6 text-sm text-gray-600">{description}</p>
      )}

      <div className="space-y-5">
        {fields.map((field) => (
          <FieldRenderer
            key={field.clientId}
            field={{
              id: field.clientId,
              type: field.type,
              label: field.label || "Untitled Field",
              placeholder: field.placeholder,
              required: field.required,
              options: field.options,
            }}
            disabled
            onClick={() => onFieldClick(field.clientId)}
            selected={selectedFieldId === field.clientId}
          />
        ))}
      </div>
    </div>
  );
}
