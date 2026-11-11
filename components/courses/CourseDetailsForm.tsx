'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import type { FormState } from '@/actions/course.actions';
import { GAMES } from '@/constants';
import { useToast } from '@/components/ui/use-toast';

type Defaults = {
  title?: string;
  subtitle?: string | null;
  description?: string;
  game?: string | null;
  coverUrl?: string | null;
  level?: string;
  priceCents?: number;
  lemonVariantId?: string | null;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary px-6 py-3">
      {pending ? 'Saving…' : label}
    </button>
  );
}

export default function CourseDetailsForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults?: Defaults;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.ok) toast({ title: 'Course details saved' });
  }, [state, toast]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="label">Title</span>
        <input name="title" required maxLength={120} defaultValue={defaults.title} className="input" placeholder="Crosshair placement fundamentals" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Subtitle</span>
        <input
          name="subtitle"
          maxLength={200}
          defaultValue={defaults.subtitle ?? ''}
          className="input"
          placeholder="Hit more first bullets with a system you can practise daily"
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-3">
        <label className="flex flex-col gap-2">
          <span className="label">Game</span>
          <input name="game" list="course-games" maxLength={60} defaultValue={defaults.game ?? ''} className="input" placeholder="Valorant" />
          <datalist id="course-games">
            {GAMES.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">Level</span>
          <select name="level" defaultValue={defaults.level ?? 'BEGINNER'} className="input">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">Price (USD, 0 = free)</span>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={((defaults.priceCents ?? 0) / 100).toString()}
            className="input"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className="label">Cover image link (optional)</span>
        <input name="coverUrl" type="url" defaultValue={defaults.coverUrl ?? ''} className="input" placeholder="https://…/cover.jpg" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Description (Markdown supported)</span>
        <textarea
          name="description"
          rows={8}
          maxLength={10000}
          defaultValue={defaults.description ?? ''}
          className="input font-mono text-[13px]"
          placeholder={'## What you will learn\n- How to hold head level on every angle\n- A daily 15 minute routine'}
        />
      </label>
      <details className="rounded-xl border border-line bg-surface-2 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink-soft">Payments (paid courses)</summary>
        <p className="mt-2 text-xs text-ink-muted">
          Create a product in Lemon Squeezy and paste its variant ID here. Buyers are enrolled automatically after payment.
        </p>
        <input
          name="lemonVariantId"
          maxLength={40}
          defaultValue={defaults.lemonVariantId ?? ''}
          className="input mt-3"
          placeholder="Lemon Squeezy variant ID, e.g. 123456"
        />
      </details>
      {state?.error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-rose-300">{state.error}</p>
      )}
      <div>
        <Submit label={submitLabel} />
      </div>
    </form>
  );
}
