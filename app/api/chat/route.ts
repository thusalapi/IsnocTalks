import { anthropic } from '@ai-sdk/anthropic';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai';

import { APPROVAL_TOOLS, buildAssistantTools, buildInstructions } from '@/lib/assistant/tools';
import { db } from '@/lib/db';
import { getDbUser } from '@/lib/db/user';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const DAILY_LIMIT = Number(process.env.ASSISTANT_DAILY_LIMIT ?? 40);
const MODEL = process.env.ASSISTANT_MODEL ?? 'claude-haiku-5-5';

function json(status: number, error: string) {
  return Response.json({ error }, { status });
}

export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user) return json(401, 'Sign in to use the assistant.');
  if (!process.env.ANTHROPIC_API_KEY) return json(503, 'The assistant is not set up yet.');

  const body = (await req.json().catch(() => null)) as { messages?: UIMessage[] } | null;
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return json(400, 'No messages.');

  // Count only fresh user messages, so tool approvals do not use up the limit.
  const last = messages[messages.length - 1];
  if (last.role === 'user') {
    const day = new Date().toISOString().slice(0, 10);
    const usage = await db.assistantUsage.upsert({
      where: { userId_day: { userId: user.id, day } },
      update: { count: { increment: 1 } },
      create: { userId: user.id, day, count: 1 },
    });
    if (usage.count > DAILY_LIMIT) return json(429, 'Daily message limit reached. Try again tomorrow.');
  }

  const viewer = { id: user.id, role: user.role, name: user.name };
  const tools = buildAssistantTools(viewer);

  const result = streamText({
    model: anthropic(MODEL),
    instructions: buildInstructions(viewer),
    // Keep the request small and bounded.
    messages: await convertToModelMessages(messages.slice(-30), { tools }),
    tools,
    toolApproval: Object.fromEntries(APPROVAL_TOOLS.map((name) => [name, 'user-approval' as const])),
    stopWhen: isStepCount(6),
    maxOutputTokens: 1200,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
