import { createCallerFactory } from "./trpc";
import { createTRPCContext } from "./trpc";
import { appRouter } from "./routers/_app";

const createCaller = createCallerFactory(appRouter);

export async function createServerCaller(request: Request) {
  const ctx = await createTRPCContext(request);
  return createCaller(ctx);
}
