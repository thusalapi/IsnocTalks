import { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

import Logo from '@/components/brand/Logo';

const points = [
  'Live 1:1 coaching with screen share',
  'VOD reviews with on-screen drawing',
  'Courses and a community (coming soon)',
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-bg lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-grid opacity-70 mask-fade-b" />
        <div className="absolute -left-32 top-1/3 size-[420px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-20 right-0 size-80 rounded-full bg-accent/20 blur-[100px]" />
        <Logo className="relative" />
        <div className="relative max-w-md">
          <p className="eyebrow">Gaming coaching platform</p>
          <h1 className="h-display mt-3 text-5xl leading-[1.05]">
            Stop guessing. <span className="text-gradient">Start climbing.</span>
          </h1>
          <ul className="mt-8 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-ink-soft">
                <CheckCircle2 size={18} className="text-accent" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-ink-faint">© {new Date().getFullYear()} IsnocTalks</p>
      </section>
      <section className="relative flex flex-col items-center justify-center gap-8 px-4 py-12">
        <div className="absolute inset-x-0 top-0 h-64 bg-radial-fade lg:hidden" />
        <Logo className="relative lg:hidden" />
        <div className="relative">{children}</div>
      </section>
    </main>
  );
}
