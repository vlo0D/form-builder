interface FieldRendererProps {
  field: {
    id: string;
    type: string;
    label: string;
    placeholder?: string | null;
    required: boolean;
    options: Record<string, unknown>;
  };
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function FieldRenderer({
  field,
  value = "",
  onChange,
  error,
  disabled,
  onClick,
  selected,
}: FieldRendererProps) {
  const isPreview = !!onClick;

  const inputClasses = [
    "w-full rounded-lg border px-3 py-2 text-gray-900",
    error ? "border-red-400" : "border-gray-300",
    isPreview ? "pointer-events-none" : "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none",
  ].join(" ");

  const wrapperClasses = isPreview
    ? [
        "rounded-lg border p-3 transition-colors",
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50",
        "cursor-pointer",
      ].join(" ")
    : "";

  return (
    <div className={wrapperClasses} onClick={onClick}>
      <label className={`mb-1 block text-sm font-medium text-gray-700 ${isPreview ? "pointer-events-none" : ""}`}>
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          rows={
            typeof field.options.rows === "number" ? field.options.rows : 3
          }
          className={inputClasses + " resize-y"}
        />
      ) : field.type === "number" ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          min={
            typeof field.options.min === "number"
              ? field.options.min
              : undefined
          }
          max={
            typeof field.options.max === "number"
              ? field.options.max
              : undefined
          }
          step={
            typeof field.options.step === "number"
              ? field.options.step
              : undefined
          }
          className={inputClasses}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          className={inputClasses}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
