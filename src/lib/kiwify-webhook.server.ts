import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizeKiwify, type KiwifyEvent } from "./kiwify";

export function validKiwifySignature(body: Uint8Array, signature: string | null, token: string) {
  if (!token || !signature || !/^[a-f0-9]{40}$/.test(signature)) return false;
  const expected = createHmac("sha1", token).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export async function handleKiwifyWebhook(request: Request, token: string | undefined, processEvent: (event: KiwifyEvent) => Promise<void>) {
  const reply = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });
  if (!token) return reply(503);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return reply(415);
  // Bound the stream before allocating/parsing an untrusted payload.
  const reader = request.body?.getReader();
  if (!reader) return reply(400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 262144) { await reader.cancel(); return reply(413); }
      chunks.push(value);
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    const signatures = new URL(request.url).searchParams.getAll("signature");
    if (signatures.length !== 1 || !validKiwifySignature(body, signatures[0], token)) return reply(401);
    let event: KiwifyEvent;
    try { event = normalizeKiwify(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body))); }
    catch { return reply(400); }
    await processEvent(event);
    return reply(204);
  } catch { return reply(503); }
}