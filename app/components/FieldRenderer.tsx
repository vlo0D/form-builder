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
  const baseClasses = `w-full rounded-lg border px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none ${
    error ? "border-red-400" : "border-gray-300"
  } ${selected ? "ring-2 ring-blue-400" : ""}`;

  const wrapperClasses = `${onClick ? "cursor-pointer" : ""} ${
    selected ? "rounded-lg bg-blue-50 p-3 -m-3" : ""
  }`;

  return (
    <div className={wrapperClasses} onClick={onClick}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
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
          className={baseClasses + " resize-y"}
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
          className={baseClasses}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          disabled={disabled}
          className={baseClasses}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
