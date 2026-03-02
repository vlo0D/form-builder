import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/routers/_app";
import { createTRPCContext } from "~/server/trpc";

function handleRequest(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createTRPCContext(request),
  });
}

export function loader({ request }: { request: Request }) {
  return handleRequest(request);
}

export function action({ request }: { request: Request }) {
  return handleRequest(request);
}
