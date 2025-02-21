import { purgeCache } from "@netlify/functions";
import {
    getSecret,
   } from 'astro:env/server';

export async function POST({ request } : {request : Request}) {
  const body = await request.json();

  // See below for information on webhook security
  if (request.headers.get("X-Payload-Webhook-Secret") !== getSecret("PAYLOAD_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }
    try {
        await purgeCache({ tags: body.updateTags });
        console.log("Purge cache successfully!")
    } catch {
        console.log("Could not purge cache!")
    }

  return new Response(`Revalidated cache with tags: ${body.updateTags.join(", ")}`, { status: 200 });
}
