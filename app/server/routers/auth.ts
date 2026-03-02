import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../trpc";
import { loginSchema } from "~/lib/validation";
import { storage, getSession } from "../auth.server";

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const session = await storage.getSession();
    session.set("userId", user.id);
    const cookie = await storage.commitSession(session);

    return { success: true, cookie };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const session = await getSession(ctx.request);
    const cookie = await storage.destroySession(session);
    return { success: true, cookie };
  }),

  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) return null;
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { id: true, email: true },
    });
    return user;
  }),
});
