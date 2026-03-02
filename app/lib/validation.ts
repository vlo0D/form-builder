import { z } from "zod";

export const fieldTypeEnum = z.enum(["text", "number", "textarea"]);
export type FieldType = z.infer<typeof fieldTypeEnum>;

export const textOptionsSchema = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
});

export const numberOptionsSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

export const textareaOptionsSchema = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(1).optional(),
  rows: z.number().int().min(1).max(50).optional(),
});

export const fieldOptionsSchema = z.union([
  textOptionsSchema,
  numberOptionsSchema,
  textareaOptionsSchema,
]);

export const fieldSchema = z.object({
  id: z.string().optional(),
  type: fieldTypeEnum,
  label: z.string().min(1, "Label is required"),
  placeholder: z.string().optional().default(""),
  required: z.boolean().default(false),
  options: z.record(z.unknown()).default({}),
  order: z.number().int().min(0),
});

export const createFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});

export const updateFormSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type FieldInput = z.infer<typeof fieldSchema>;
export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export function buildDynamicValidationSchema(
  fields: Array<{
    id: string;
    type: string;
    label: string;
    required: boolean;
    options: Record<string, unknown>;
  }>,
) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const opts = field.options;

    if (field.type === "text" || field.type === "textarea") {
      let schema = z.string();
      if (typeof opts.minLength === "number") {
        schema = schema.min(
          opts.minLength,
          `Minimum ${opts.minLength} characters`,
        );
      }
      if (typeof opts.maxLength === "number") {
        schema = schema.max(
          opts.maxLength,
          `Maximum ${opts.maxLength} characters`,
        );
      }
      shape[field.id] = field.required
        ? schema.min(1, `${field.label} is required`)
        : schema.optional().or(z.literal(""));
    } else if (field.type === "number") {
      let schema = z.coerce.number();
      if (typeof opts.min === "number") {
        schema = schema.min(opts.min, `Minimum value is ${opts.min}`);
      }
      if (typeof opts.max === "number") {
        schema = schema.max(opts.max, `Maximum value is ${opts.max}`);
      }
      shape[field.id] = field.required
        ? schema
        : schema.optional().or(z.literal("").transform(() => undefined));
    }
  }

  return z.object(shape);
}
