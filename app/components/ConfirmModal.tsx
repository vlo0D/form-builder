interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  data: Record<string, unknown>;
  fields: Array<{
    id: string;
    label: string;
    type: string;
  }>;
}

export function ConfirmModal({
  open,
  onConfirm,
  onCancel,
  loading,
  data,
  fields,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Confirm Submission
        </h2>
        <p className="mb-4 text-sm text-gray-600">
          Please review your answers before submitting:
        </p>

        <div className="mb-6 space-y-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <p className="text-xs font-medium text-gray-500">
                {field.label}
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {String(data[field.id] ?? "—")}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
