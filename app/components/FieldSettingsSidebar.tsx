import type { FieldType } from "~/lib/validation";

export interface EditableField {
  clientId: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options: Record<string, unknown>;
  order: number;
}

interface FieldSettingsSidebarProps {
  field: EditableField;
  onUpdate: (updates: Partial<EditableField>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function FieldSettingsSidebar({
  field,
  onUpdate,
  onDelete,
  onClose,
}: FieldSettingsSidebarProps) {
  function updateOption(key: string, value: unknown) {
    onUpdate({
      options: { ...field.options, [key]: value === "" ? undefined : value },
    });
  }

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Type: <span className="font-medium capitalize">{field.type}</span>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Label
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">Required</span>
        </label>

        {(field.type === "text" || field.type === "textarea") && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Min Length
              </label>
              <input
                type="number"
                min={0}
                value={
                  typeof field.options.minLength === "number"
                    ? field.options.minLength
                    : ""
                }
                onChange={(e) =>
                  updateOption(
                    "minLength",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max Length
              </label>
              <input
                type="number"
                min={1}
                value={
                  typeof field.options.maxLength === "number"
                    ? field.options.maxLength
                    : ""
                }
                onChange={(e) =>
                  updateOption(
                    "maxLength",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </>
        )}

        {field.type === "textarea" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Rows
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={
                typeof field.options.rows === "number"
                  ? field.options.rows
                  : ""
              }
              onChange={(e) =>
                updateOption(
                  "rows",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
        )}

        {field.type === "number" && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Min
              </label>
              <input
                type="number"
                value={
                  typeof field.options.min === "number"
                    ? field.options.min
                    : ""
                }
                onChange={(e) =>
                  updateOption(
                    "min",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Max
              </label>
              <input
                type="number"
                value={
                  typeof field.options.max === "number"
                    ? field.options.max
                    : ""
                }
                onChange={(e) =>
                  updateOption(
                    "max",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Step
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={
                  typeof field.options.step === "number"
                    ? field.options.step
                    : ""
                }
                onChange={(e) =>
                  updateOption(
                    "step",
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <button
        onClick={onDelete}
        className="mt-4 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete Field
      </button>
    </div>
  );
}
