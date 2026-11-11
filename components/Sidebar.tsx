import Link from 'next/link';
import { Plus, Sparkles } from 'lucide-react';

import BecomeCoachButton from '@/components/BecomeCoachButton';
import Logo from '@/components/brand/Logo';
import NavList from '@/components/layout/NavList';
import { getDbUser } from '@/lib/db/user';

const Sidebar = async () => {
  const user = await getDbUser();
  const isCoach = user && user.role !== 'STUDENT';

  return (
    <aside className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-line bg-surface/60 px-4 py-5 lg:flex">
      <Logo href="/dashboard" className="px-2" />
      <div className="mt-8 flex-1 overflow-y-auto">
        <NavList />
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-surface-2 p-4">
        <div className="absolute -right-10 -top-10 size-28 rounded-full bg-primary/30 blur-2xl" />
        <Sparkles size={18} className="relative text-accent" />
        {isCoach ? (
          <>
            <p className="relative mt-2 font-display text-sm font-semibold">Coach tools</p>
            <p className="relative mt-1 text-xs text-ink-muted">Package your knowledge into a course or start a space.</p>
            <Link href="/courses/new" className="btn-primary relative mt-3 w-full py-2 text-xs">
              <Plus size={14} /> New course
            </Link>
          </>
        ) : (
          <>
            <p className="relative mt-2 font-display text-sm font-semibold">Become a coach</p>
            <p className="relative mt-1 text-xs text-ink-muted">Sell sessions, VOD reviews and courses to your community.</p>
            <BecomeCoachButton className="relative mt-3 w-full py-2 text-xs" label="Start coaching" />
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
