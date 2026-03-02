import { z } from "zod";
import { TRPCError } from "@trpc/server";
import type { Prisma } from "@prisma/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { createFormSchema, updateFormSchema } from "~/lib/validation";

export const formRouter = router({
  listPublished: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.form.findMany({
      include: { fields: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.id },
        include: { fields: { orderBy: { order: "asc" } } },
      });
      if (!form) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return form;
    }),

  listMy: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.form.findMany({
      where: { userId: ctx.userId },
      include: {
        fields: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(createFormSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.form.create({
        data: {
          title: input.title,
          description: input.description,
          userId: ctx.userId,
          fields: {
            create: input.fields.map((field, index) => ({
              type: field.type,
              label: field.label,
              placeholder: field.placeholder,
              required: field.required,
              options: field.options as Prisma.InputJsonValue,
              order: index,
            })),
          },
        },
        include: { fields: { orderBy: { order: "asc" } } },
      });
    }),

  update: protectedProcedure
    .input(updateFormSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.id },
      });
      if (!form || form.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }

      return ctx.prisma.$transaction(async (tx) => {
        await tx.field.deleteMany({ where: { formId: input.id } });

        return tx.form.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            fields: {
              create: input.fields.map((field, index) => ({
                type: field.type,
                label: field.label,
                placeholder: field.placeholder,
                required: field.required,
                options: field.options as Prisma.InputJsonValue,
                order: index,
              })),
            },
          },
          include: { fields: { orderBy: { order: "asc" } } },
        });
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const form = await ctx.prisma.form.findUnique({
        where: { id: input.id },
      });
      if (!form || form.userId !== ctx.userId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      }
      return ctx.prisma.form.delete({ where: { id: input.id } });
    }),

});
