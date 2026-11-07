'use client';

import { useFormState, useFormStatus } from 'react-dom';

import { createVod, type ActionState } from '@/actions/vod.actions';

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Apex Legends', 'Fortnite', 'Overwatch 2', 'PUBG', 'Rocket League', 'Other'];

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-blue-1 px-5 py-3 font-semibold disabled:opacity-50">
      {pending ? 'Creating…' : 'Create review'}
    </button>
  );
}

const field = 'w-full rounded-lg bg-dark-3 px-3 py-3 text-white outline-none focus:ring-1 focus:ring-blue-1';

export default function NewVodForm() {
  const [state, formAction] = useFormState<ActionState, FormData>(createVod, undefined);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Video link</span>
        <input name="videoUrl" required placeholder="https://www.youtube.com/watch?v=… or https://…/clip.mp4" className={field} />
        <span className="text-sm text-sky-1">
          YouTube links (unlisted works) or a direct link to an .mp4 or .webm file. File uploads are coming in Phase 2.
        </span>
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Title</span>
        <input name="title" required maxLength={120} placeholder="Ranked match on Ascent, round 7 retake" className={field} />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Game</span>
        <input name="game" list="games" maxLength={60} placeholder="Valorant" className={field} />
        <datalist id="games">
          {GAMES.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-semibold">Context (optional)</span>
        <textarea
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="Player rank, role, what they want feedback on…"
          className={field}
        />
      </label>
      {state?.error && <p className="rounded-lg bg-red-600/20 p-3 text-sm text-red-300">{state.error}</p>}
      <div>
        <Submit />
      </div>
    </form>
  );
}
