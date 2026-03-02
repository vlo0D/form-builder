import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { buildDynamicValidationSchema } from "~/lib/validation";

export const submissionRouter = router({
  create: publicProcedure
    .input(
      z.object({
        formId: z.string(),
        data: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.formId, published: true },
        include: { fields: { orderBy: { order: "asc" } } },
      });

      if (!form) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Form not found or not published",
        });
      }

      const validationSchema = buildDynamicValidationSchema(
        form.fields.map((f) => ({
          ...f,
          options: f.options as Record<string, unknown>,
        })),
      );
      const parsed = validationSchema.safeParse(input.data);

      if (!parsed.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Validation failed",
          cause: parsed.error,
        });
      }

      return ctx.prisma.submission.create({
        data: {
          formId: input.formId,
          data: parsed.data,
        },
      });
    }),

  listByForm: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.formId },
      });
      if (!form || form.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return ctx.prisma.submission.findMany({
        where: { formId: input.formId },
        orderBy: { createdAt: "desc" },
      });
    }),
});
