import 'server-only';
import crypto from 'node:crypto';

const API = 'https://api.lemonsqueezy.com/v1';

export function isLemonConfigured() {
  return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID);
}

/** Creates a hosted checkout for one course and returns its URL. */
export async function createCourseCheckout(opts: {
  variantId: string;
  userId: string;
  courseId: string;
  email?: string;
  name?: string;
  redirectUrl: string;
}) {
  const res = await fetch(`${API}/checkouts`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: opts.email,
            name: opts.name,
            custom: { user_id: opts.userId, course_id: opts.courseId },
          },
          product_options: { redirect_url: opts.redirectUrl },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(opts.variantId) } },
        },
      },
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Lemon Squeezy checkout failed (${res.status})`);
  const json = (await res.json()) as { data: { attributes: { url: string } } };
  return json.data.attributes.url;
}

/** Checks the X-Signature header against the raw request body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(digest, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
