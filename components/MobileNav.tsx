'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/brand/Logo';
import NavList from '@/components/layout/NavList';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="btn-icon lg:hidden" aria-label="Open menu">
          <Menu size={18} />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] border-line bg-surface p-5 text-ink">
        <Logo href="/dashboard" />
        <div className="mt-8">
          <NavList onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
