import { useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { FormPreview } from "./FormPreview";
import {
  FieldSettingsSidebar,
  type EditableField,
} from "./FieldSettingsSidebar";
import { trpc } from "~/lib/trpc";
import type { FieldType } from "~/lib/validation";

const copilotEnabled = !!import.meta.env.VITE_COPILOT_CLOUD_PUBLIC_API_KEY;

interface FormEditorProps {
  initialTitle?: string;
  initialDescription?: string;
  initialFields?: EditableField[];
  formId?: string;
}

let nextId = 1;
function generateClientId() {
  return `field_${Date.now()}_${nextId++}`;
}

function CopilotActions({
  title,
  description,
  fields,
  setFields,
  setSelectedFieldId,
  updateField,
  deleteField,
}: {
  title: string;
  description: string;
  fields: EditableField[];
  setFields: Dispatch<SetStateAction<EditableField[]>>;
  setSelectedFieldId: Dispatch<SetStateAction<string | null>>;
  updateField: (clientId: string, updates: Partial<EditableField>) => void;
  deleteField: (clientId: string) => void;
}) {
  useCopilotReadable({
    description: "Current form state: title, description, and list of fields with their settings",
    value: JSON.stringify({
      title,
      description,
      fields: fields.map((f) => ({
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
      })),
    }),
  });

  useCopilotAction({
    name: "addField",
    description:
      "Add a new field to the form. Available types: text, number, textarea.",
    parameters: [
      {
        name: "type",
        type: "string",
        description: "Field type: text, number, or textarea",
        required: true,
      },
      {
        name: "label",
        type: "string",
        description: "Label shown above the field",
        required: true,
      },
      {
        name: "placeholder",
        type: "string",
        description: "Placeholder text inside the field",
      },
      {
        name: "required",
        type: "boolean",
        description: "Whether the field is required",
      },
    ],
    handler: ({ type, label, placeholder, required: isRequired }) => {
      const validType = (["text", "number", "textarea"].includes(type)
        ? type
        : "text") as FieldType;
      const newField: EditableField = {
        clientId: generateClientId(),
        type: validType,
        label: label || `New ${validType} field`,
        placeholder: placeholder || "",
        required: isRequired ?? false,
        options: {},
        order: fields.length,
      };
      setFields((prev) => [...prev, newField]);
      setSelectedFieldId(newField.clientId);
    },
  });

  useCopilotAction({
    name: "updateField",
    description:
      "Update an existing field by its current label. Can change label, type, placeholder, or required.",
    parameters: [
      {
        name: "currentLabel",
        type: "string",
        description: "The current label of the field to update",
        required: true,
      },
      {
        name: "label",
        type: "string",
        description: "New label for the field",
      },
      {
        name: "type",
        type: "string",
        description: "New type: text, number, or textarea",
      },
      {
        name: "placeholder",
        type: "string",
        description: "New placeholder text",
      },
      {
        name: "required",
        type: "boolean",
        description: "Whether the field is required",
      },
    ],
    handler: ({ currentLabel, label, type, placeholder, required: isRequired }) => {
      const target = fields.find(
        (f) => f.label.toLowerCase() === currentLabel.toLowerCase(),
      );
      if (!target) return;
      const updates: Partial<EditableField> = {};
      if (label !== undefined) updates.label = label;
      if (placeholder !== undefined) updates.placeholder = placeholder;
      if (isRequired !== undefined) updates.required = isRequired;
      if (type && ["text", "number", "textarea"].includes(type)) {
        updates.type = type as FieldType;
        if (type !== target.type) updates.options = {};
      }
      updateField(target.clientId, updates);
    },
  });

  useCopilotAction({
    name: "deleteField",
    description: "Delete a field from the form by its label.",
    parameters: [
      {
        name: "label",
        type: "string",
        description: "The label of the field to delete",
        required: true,
      },
    ],
    handler: ({ label }) => {
      const target = fields.find(
        (f) => f.label.toLowerCase() === label.toLowerCase(),
      );
      if (!target) return;
      deleteField(target.clientId);
    },
  });

  return null;
}

export function FormEditor({
  initialTitle = "",
  initialDescription = "",
  initialFields = [],
  formId,
}: FormEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [fields, setFields] = useState<EditableField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedField = fields.find((f) => f.clientId === selectedFieldId);

  function addField(type: FieldType) {
    const newField: EditableField = {
      clientId: generateClientId(),
      type,
      label: `New ${type} field`,
      placeholder: "",
      required: false,
      options: {},
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.clientId);
  }

  function updateField(clientId: string, updates: Partial<EditableField>) {
    setFields((prev) =>
      prev.map((f) => (f.clientId === clientId ? { ...f, ...updates } : f)),
    );
  }

  function deleteField(clientId: string) {
    setFields((prev) => prev.filter((f) => f.clientId !== clientId));
    if (selectedFieldId === clientId) setSelectedFieldId(null);
  }

  function moveField(clientId: string, direction: "up" | "down") {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.clientId === clientId);
      if (idx === -1) return prev;
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;

      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((f, i) => ({ ...f, order: i }));
    });
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (fields.length === 0) {
      setError("At least one field is required");
      return;
    }

    setError("");
    setSaving(true);

    const fieldInputs = fields.map((f, i) => ({
      type: f.type,
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      options: Object.fromEntries(
        Object.entries(f.options).filter(([, v]) => v !== undefined),
      ),
      order: i,
    }));

    try {
      if (formId) {
        await trpc.form.update.mutate({
          id: formId,
          title: title.trim(),
          description: description.trim(),
          fields: fieldInputs,
        });
      } else {
        await trpc.form.create.mutate({
          title: title.trim(),
          description: description.trim(),
          fields: fieldInputs,
        });
      }
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save form");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-6">
      {copilotEnabled && (
        <CopilotActions
          title={title}
          description={description}
          fields={fields}
          setFields={setFields}
          setSelectedFieldId={setSelectedFieldId}
          updateField={updateField}
          deleteField={deleteField}
        />
      )}
      <div className="flex-1">
        <div className="mb-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Form Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Add field:
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => addField("text")}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-base leading-none">Aa</span>
                Text
              </button>
              <button
                onClick={() => addField("number")}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-base leading-none">#</span>
                Number
              </button>
              <button
                onClick={() => addField("textarea")}
                className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="text-base leading-none">&#9776;</span>
                Textarea
              </button>
            </div>
          </div>
        </div>

        {/* Reorder controls */}
        {fields.length > 1 && selectedField && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Move selected:</span>
            <button
              onClick={() => moveField(selectedField.clientId, "up")}
              className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
            >
              &uarr; Up
            </button>
            <button
              onClick={() => moveField(selectedField.clientId, "down")}
              className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
            >
              &darr; Down
            </button>
          </div>
        )}

        <FormPreview
          title={title}
          description={description}
          fields={fields}
          selectedFieldId={selectedFieldId}
          onFieldClick={setSelectedFieldId}
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : formId ? "Update Form" : "Create Form"}
          </button>
          <button
            onClick={() => navigate("/admin")}
            className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>

      {selectedField && (
        <div className="w-80 shrink-0">
          <FieldSettingsSidebar
            field={selectedField}
            onUpdate={(updates) =>
              updateField(selectedField.clientId, updates)
            }
            onDelete={() => deleteField(selectedField.clientId)}
            onClose={() => setSelectedFieldId(null)}
          />
        </div>
      )}

    </div>
  );
}
