import { authenticate } from "app/shopify.server";

export async function loader({ request }) {
  await authenticate.public.appProxy(request);
  const url = new URL(request.url);
  const logged_in_customer_id = url.searchParams.get("logged_in_customer_id");
  const path_prefix = url.searchParams.get("path_prefix");
  const shop = url.searchParams.get("shop");
  const signature = url.searchParams.get("signature");
  const timestamp = url.searchParams.get("timestamp");
  const queryParams = `logged_in_customer_id=${logged_in_customer_id}&path_prefix=${path_prefix}&shop=${shop}&signature=${signature}&timestamp=${timestamp}`;
  const responseDto = {
    queryParams,
  };
  return new Response(JSON.stringify(responseDto));
}
