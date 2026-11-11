import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/payments/lemonsqueezy';

export const dynamic = 'force-dynamic';

type LemonEvent = {
  meta: { event_name: string; custom_data?: { user_id?: string; course_id?: string } };
  data: { id: string; attributes: { status?: string } };
};

/** Grants or removes course access when Lemon Squeezy reports an order change. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get('x-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(raw) as LemonEvent;
  const userId = event.meta.custom_data?.user_id;
  const courseId = event.meta.custom_data?.course_id;
  if (!userId || !courseId) return NextResponse.json({ ok: true, skipped: 'no custom data' });

  const orderId = event.data.id;

  if (event.meta.event_name === 'order_created' && event.data.attributes.status === 'paid') {
    await db.enrollment.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { source: 'PURCHASE', orderId },
      create: { userId, courseId, source: 'PURCHASE', orderId },
    });
  }

  if (event.meta.event_name === 'order_refunded') {
    await db.enrollment.deleteMany({ where: { userId, courseId, orderId } });
  }

  return NextResponse.json({ ok: true });
}
