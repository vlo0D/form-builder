import { destroyUserSession } from "~/server/auth.server";

export async function action({ request }: { request: Request }) {
  return destroyUserSession(request);
}

export default function AdminLogout() {
  return null;
}
