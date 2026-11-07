'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { createVod, type ActionState } from '@/actions/vod.actions';
import { GAMES } from '@/constants';


function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary px-6 py-3">
      {pending ? 'Creating…' : 'Create review'}
    </button>
  );
}

const field = 'input';

export default function NewVodForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(createVod, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="label">Video link</span>
        <input name="videoUrl" required placeholder="https://www.youtube.com/watch?v=… or https://…/clip.mp4" className={field} />
        <span className="text-xs text-ink-faint">
          YouTube links (unlisted works) or a direct link to an .mp4 or .webm file. File uploads are coming in Phase 2.
        </span>
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Title</span>
        <input name="title" required maxLength={120} placeholder="Ranked match on Ascent, round 7 retake" className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Game</span>
        <input name="game" list="games" maxLength={60} placeholder="Valorant" className={field} />
        <datalist id="games">
          {GAMES.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-2">
        <span className="label">Context (optional)</span>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Player rank, role, what they want feedback on…"
          className={field}
        />
      </label>
      {state?.error && <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-rose-300">{state.error}</p>}
      <div>
        <Submit />
      </div>
    </form>
  );
}
