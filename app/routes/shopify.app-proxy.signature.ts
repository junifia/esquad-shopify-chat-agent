import { authenticate } from "app/shopify.server";
import type { Route } from "./+types/shopify.app-proxy.signature";

export async function loader({ request }: Route.LoaderArgs) {
  await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const responseDto = Object.fromEntries(url.searchParams.entries());
  return new Response(JSON.stringify(responseDto));
}
