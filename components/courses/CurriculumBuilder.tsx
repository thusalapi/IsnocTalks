'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, FileText, GripVertical, PlayCircle, Plus, Trash2 } from 'lucide-react';

import {
  addLesson,
  addModule,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  renameModule,
  updateLesson,
} from '@/actions/course.actions';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export type BuilderLesson = {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT';
  videoUrl: string | null;
  content: string;
  durationMin: number | null;
  isPreview: boolean;
};
export type BuilderModule = { id: string; title: string; lessons: BuilderLesson[] };

function useAction() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>, done?: string) =>
    start(async () => {
      try {
        await fn();
        if (done) toast({ title: done });
        router.refresh();
      } catch (e) {
        toast({ title: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
      }
    });
  return { pending, run };
}

function LessonEditor({ lesson, onClose }: { lesson: BuilderLesson; onClose: () => void }) {
  const { pending, run } = useAction();
  const [form, setForm] = useState({
    title: lesson.title,
    type: lesson.type,
    videoUrl: lesson.videoUrl ?? '',
    content: lesson.content,
    durationMin: lesson.durationMin?.toString() ?? '',
    isPreview: lesson.isPreview,
  });

  return (
    <div className="flex flex-col gap-4 border-t border-line bg-surface-2/60 p-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_160px_120px]">
        <label className="flex flex-col gap-1.5">
          <span className="label">Lesson title</span>
          <input className="input" value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label">Type</span>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'VIDEO' | 'TEXT' })}
          >
            <option value="VIDEO">Video</option>
            <option value="TEXT">Text</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label">Minutes</span>
          <input
            className="input"
            type="number"
            min={0}
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
          />
        </label>
      </div>
      {form.type === 'VIDEO' && (
        <label className="flex flex-col gap-1.5">
          <span className="label">Video link (YouTube unlisted or .mp4)</span>
          <input
            className="input"
            type="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="label">{form.type === 'VIDEO' ? 'Notes under the video (Markdown)' : 'Lesson content (Markdown)'}</span>
        <textarea
          className="input font-mono text-[13px]"
          rows={form.type === 'TEXT' ? 10 : 5}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <label className="chip cursor-pointer py-2 text-sm">
          <input type="checkbox" checked={form.isPreview} onChange={(e) => setForm({ ...form, isPreview: e.target.checked })} />
          Free preview
        </label>
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            disabled={pending}
            onClick={() =>
              run(
                () =>
                  updateLesson(lesson.id, {
                    title: form.title,
                    type: form.type,
                    videoUrl: form.videoUrl,
                    content: form.content,
                    durationMin: form.durationMin ? Number(form.durationMin) : undefined,
                    isPreview: form.isPreview,
                  }),
                'Lesson saved'
              )
            }
          >
            {pending ? 'Saving…' : 'Save lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CurriculumBuilder({ courseId, modules }: { courseId: string; modules: BuilderModule[] }) {
  const { pending, run } = useAction();
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [newModule, setNewModule] = useState('');
  const [newLesson, setNewLesson] = useState<Record<string, string>>({});

  return (
    <div className={cn('flex flex-col gap-4', pending && 'opacity-80')}>
      {modules.map((m, mi) => (
        <div key={m.id} className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-3">
            <GripVertical size={16} className="text-ink-faint" />
            <span className="font-display text-sm font-semibold text-ink-muted">{mi + 1}.</span>
            <input
              defaultValue={m.title}
              onBlur={(e) => e.target.value !== m.title && run(() => renameModule(m.id, e.target.value))}
              className="flex-1 bg-transparent font-display font-semibold outline-none focus:text-primary"
              aria-label="Module title"
            />
            <button className="btn-icon size-8" disabled={mi === 0} onClick={() => run(() => moveModule(m.id, -1))} title="Move up">
              <ChevronUp size={15} />
            </button>
            <button
              className="btn-icon size-8"
              disabled={mi === modules.length - 1}
              onClick={() => run(() => moveModule(m.id, 1))}
              title="Move down"
            >
              <ChevronDown size={15} />
            </button>
            <button
              className="btn-icon size-8 hover:text-danger"
              onClick={() => confirm(`Delete "${m.title}" and its lessons?`) && run(() => deleteModule(m.id), 'Module deleted')}
              title="Delete module"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <ul>
            {m.lessons.map((l, li) => {
              const Icon = l.type === 'VIDEO' ? PlayCircle : FileText;
              const missingVideo = l.type === 'VIDEO' && !l.videoUrl;
              return (
                <li key={l.id} className="border-b border-line last:border-none">
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <Icon size={16} className="shrink-0 text-primary" />
                    <button
                      className="flex-1 truncate text-left text-sm hover:text-primary"
                      onClick={() => setOpenLesson(openLesson === l.id ? null : l.id)}
                    >
                      {l.title}
                    </button>
                    {l.isPreview && <span className="chip py-0.5 text-[10px] text-accent">Preview</span>}
                    {missingVideo && <span className="chip py-0.5 text-[10px] text-warn">No video</span>}
                    <button className="btn-icon size-7" disabled={li === 0} onClick={() => run(() => moveLesson(l.id, -1))}>
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className="btn-icon size-7"
                      disabled={li === m.lessons.length - 1}
                      onClick={() => run(() => moveLesson(l.id, 1))}
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      className="btn-icon size-7 hover:text-danger"
                      onClick={() => confirm(`Delete "${l.title}"?`) && run(() => deleteLesson(l.id), 'Lesson deleted')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {openLesson === l.id && <LessonEditor lesson={l} onClose={() => setOpenLesson(null)} />}
                </li>
              );
            })}
          </ul>

          <form
            className="flex gap-2 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => addLesson(m.id, newLesson[m.id] ?? ''));
              setNewLesson({ ...newLesson, [m.id]: '' });
            }}
          >
            <input
              className="input py-2"
              placeholder="New lesson title"
              value={newLesson[m.id] ?? ''}
              onChange={(e) => setNewLesson({ ...newLesson, [m.id]: e.target.value })}
            />
            <button className="btn-ghost shrink-0 py-2" type="submit">
              <Plus size={15} /> Lesson
            </button>
          </form>
        </div>
      ))}

      <form
        className="card flex gap-2 border-dashed p-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addModule(courseId, newModule), 'Module added');
          setNewModule('');
        }}
      >
        <input className="input py-2" placeholder="New module title" value={newModule} onChange={(e) => setNewModule(e.target.value)} />
        <button className="btn-primary shrink-0 py-2" type="submit">
          <Plus size={15} /> Module
        </button>
      </form>
    </div>
  );
}
