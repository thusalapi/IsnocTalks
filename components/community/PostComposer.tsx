'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Film } from 'lucide-react';

import type { FormState } from '@/actions/community.actions';
import UserAvatar from '@/components/UserAvatar';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Posting…' : 'Post'}
    </button>
  );
}

export default function PostComposer({
  action,
  user,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  user: { name: string | null; imageUrl: string | null };
}) {
  const [state, formAction] = useFormState<FormState, FormData>(action, undefined);
  const [expanded, setExpanded] = useState(false);
  const [showClip, setShowClip] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setExpanded(false);
      setShowClip(false);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="card flex flex-col gap-3 p-4">
      <div className="flex gap-3">
        <UserAvatar name={user.name} imageUrl={user.imageUrl} />
        <div className="flex flex-1 flex-col gap-2">
          {expanded && <input name="title" maxLength={140} placeholder="Title (optional)" className="input py-2.5 font-semibold" />}
          <textarea
            name="body"
            required
            maxLength={5000}
            rows={expanded ? 4 : 1}
            onFocus={() => setExpanded(true)}
            placeholder="Share a clip, ask a question or post a tip…"
            className="input resize-none py-2.5"
          />
          {showClip && <input name="clipUrl" type="url" placeholder="YouTube or video link" className="input py-2.5" />}
        </div>
      </div>
      {expanded && (
        <div className="flex items-center gap-2 pl-12">
          <button type="button" onClick={() => setShowClip(!showClip)} className="btn-ghost py-2 text-xs">
            <Film size={14} /> {showClip ? 'Remove clip' : 'Add clip'}
          </button>
          {state?.error && <p className="text-xs text-rose-300">{state.error}</p>}
          <div className="ml-auto">
            <Submit />
          </div>
        </div>
      )}
    </form>
  );
}
