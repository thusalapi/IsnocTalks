import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import Logo from '@/components/brand/Logo';
import NavList from '@/components/layout/NavList';

const Sidebar = () => {
  return (
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-5 lg:flex">
      <Logo href="/dashboard" className="px-2" />
      <div className="mt-8 flex-1 overflow-y-auto">
        <NavList />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-surface-2 p-4">
        <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/30 blur-2xl" />
        <Sparkles size={18} className="text-accent" />
        <p className="mt-2 font-display text-sm font-semibold">Become a coach</p>
        <p className="mt-1 text-xs text-ink-muted">Sell sessions, VOD reviews and courses to your community.</p>
        <Link href="/vods/new" className="btn-primary mt-3 w-full py-2 text-xs">
          Start a review
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
