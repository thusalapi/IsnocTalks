'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { createSpace, type FormState } from '@/actions/community.actions';
import { GAMES } from '@/constants';

const COLORS = ['#8B5CF6', '#22D3EE', '#F472B6', '#FBBF24', '#34D399', '#F43F5E'];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary px-6 py-3">
      {pending ? 'Creating…' : 'Create space'}
    </button>
  );
}

export default function SpaceForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [state, action] = useFormState<FormState, FormData>(createSpace, undefined);
  return (
    <form action={action} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="label">Name</span>
        <input name="name" required maxLength={60} className="input" placeholder="Valorant aim lab" />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Description</span>
        <textarea name="description" rows={3} maxLength={500} className="input" placeholder="What members talk about here" />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="label">Game (optional)</span>
          <input name="game" list="space-games" maxLength={60} className="input" />
          <datalist id="space-games">
            {GAMES.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </label>
        <label className="flex flex-col gap-2">
          <span className="label">Who can join</span>
          <select name="courseId" className="input" defaultValue="">
            <option value="">Anyone (open space)</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                Students of: {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="flex flex-col gap-2">
        <span className="label">Colour</span>
        <div className="flex gap-3">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={i === 0} className="peer sr-only" />
              <span
                className="block size-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-surface peer-checked:ring-white"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </fieldset>
      {state?.error && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-rose-300">{state.error}</p>}
      <div>
        <Submit />
      </div>
    </form>
  );
}
