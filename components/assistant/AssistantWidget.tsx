'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import {
  DefaultChatTransport,
  getToolName,
  isToolUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
} from 'ai';
import { Bot, Check, Loader2, Send, Sparkles, Square, X } from 'lucide-react';

import Markdown from '@/components/Markdown';
import { cn } from '@/lib/utils';

const TOOL_LABELS: Record<string, { running: string; done: string; ask?: (input: Record<string, unknown>) => string }> = {
  searchCourses: { running: 'Searching courses', done: 'Searched courses' },
  getCourseOutline: { running: 'Reading the course outline', done: 'Read the course outline' },
  getMyLearning: { running: 'Checking your progress', done: 'Checked your progress' },
  listMyReviews: { running: 'Looking up your VOD reviews', done: 'Looked up your VOD reviews' },
  getReviewNotes: { running: 'Reading the review notes', done: 'Read the review notes' },
  listSpaces: { running: 'Looking up spaces', done: 'Looked up spaces' },
  enrollInFreeCourse: {
    running: 'Enrolling you',
    done: 'Enrolled',
    ask: (i) => `Enrol you in the free course "${String(i.slug ?? '')}"?`,
  },
  createVodReview: {
    running: 'Creating the review',
    done: 'Review created',
    ask: (i) => `Create a VOD review called "${String(i.title ?? '')}" from ${String(i.videoUrl ?? 'this link')}?`,
  },
  joinSpace: {
    running: 'Joining the space',
    done: 'Joined the space',
    ask: (i) => `Join the space "${String(i.slug ?? '')}" for you?`,
  },
};

const SUGGESTIONS = [
  'What should I learn next?',
  'Summarise the feedback on my latest VOD review',
  'Find a free beginner course',
  'Which spaces should I join?',
];

export default function AssistantWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, stop, clearError, addToolApprovalResponse } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    // Actions change data, so refresh the page behind the panel when a turn ends.
    onFinish: () => router.refresh(),
  });

  const busy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    clearError();
    sendMessage({ text: t });
    setInput('');
  };

  let errorText: string | null = null;
  if (error) {
    try {
      errorText = (JSON.parse(error.message) as { error?: string }).error ?? null;
    } catch {
      errorText = null;
    }
    errorText ??= 'Something went wrong. Please try again.';
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className="flex-center fixed bottom-5 right-5 z-50 size-14 rounded-full bg-brand-gradient text-white shadow-glow transition hover:scale-105"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div className="card fixed bottom-24 right-5 z-50 flex h-[min(620px,calc(100vh-8rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden border-primary/40 shadow-glow">
          <header className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-3">
            <span className="flex-center size-9 rounded-xl bg-brand-gradient">
              <Bot size={18} />
            </span>
            <div>
              <p className="font-display font-semibold leading-tight">IsnocTalks assistant</p>
              <p className="text-xs text-ink-muted">Courses, VOD feedback and community</p>
            </div>
          </header>

          <div ref={scrollRef} className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-ink-muted">
                  Ask me to find a course, explain your coach&apos;s feedback, or set things up for you.
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-left text-sm text-ink-soft transition hover:border-primary/50 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn('flex flex-col gap-2', m.role === 'user' ? 'items-end' : 'items-start')}>
                {m.parts.map((part, i) => {
                  if (part.type === 'text') {
                    if (!part.text) return null;
                    return m.role === 'user' ? (
                      <p key={i} className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary-600 px-3.5 py-2 text-sm text-white">
                        {part.text}
                      </p>
                    ) : (
                      <div key={i} className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3.5 py-2">
                        <Markdown className="prose-sm prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">{part.text}</Markdown>
                      </div>
                    );
                  }

                  if (!isToolUIPart(part)) return null;
                  const name = getToolName(part);
                  const label = TOOL_LABELS[name] ?? { running: 'Working', done: 'Done' };
                  const inputObj = (part.input ?? {}) as Record<string, unknown>;

                  if (part.state === 'approval-requested' && !part.approval.isAutomatic) {
                    return (
                      <div key={i} className="w-full rounded-xl border border-warn/40 bg-warn/10 p-3">
                        <p className="text-sm font-semibold">{label.ask?.(inputObj) ?? 'Allow this action?'}</p>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="btn-primary px-3 py-1.5 text-xs"
                            onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: true })}
                          >
                            <Check size={13} /> Yes, do it
                          </button>
                          <button
                            className="btn-ghost px-3 py-1.5 text-xs"
                            onClick={() => addToolApprovalResponse({ id: part.approval.id, approved: false })}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const finished = part.state === 'output-available';
                  const failed = part.state === 'output-error';
                  const denied = part.state === 'output-denied';
                  return (
                    <span key={i} className={cn('chip text-[11px]', failed && 'border-danger/40 text-rose-300')}>
                      {finished ? (
                        <Check size={11} className="text-success" />
                      ) : failed || denied ? (
                        <X size={11} />
                      ) : (
                        <Loader2 size={11} className="animate-spin" />
                      )}
                      {finished ? label.done : failed ? 'That step failed' : denied ? 'Cancelled' : `${label.running}…`}
                    </span>
                  );
                })}
              </div>
            ))}

            {status === 'submitted' && (
              <span className="chip w-fit text-[11px]">
                <Loader2 size={11} className="animate-spin" /> Thinking…
              </span>
            )}
            {errorText && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-rose-300">{errorText}</p>}
          </div>

          <form
            className="flex gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder="Ask the assistant…"
              className="input py-2.5"
            />
            {busy ? (
              <button type="button" onClick={stop} className="btn-ghost shrink-0 px-3" aria-label="Stop">
                <Square size={15} />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="btn-primary shrink-0 px-3" aria-label="Send">
                <Send size={15} />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
