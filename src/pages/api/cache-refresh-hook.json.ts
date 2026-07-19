import type { APIContext } from "astro";
import {
    getSecret,
   } from 'astro:env/server';

export async function POST({ request, cache } : APIContext) {
  const body = await request.json();

  // See below for information on webhook security
  if (request.headers.get("X-Payload-Webhook-Secret") !== getSecret("PAYLOAD_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }
    try {
        await cache.invalidate({ tags: body.updateTags });
        console.info("Purge cache successfully!", body.updateTags)
    } catch {
        console.info("Could not purge cache!")
    }

  return new Response(`Revalidated cache with tags: ${body.updateTags.join(", ")}`, { status: 200 });
}
