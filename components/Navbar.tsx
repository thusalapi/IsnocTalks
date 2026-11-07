import Link from 'next/link';
import { Plus } from 'lucide-react';
import { SignedIn, UserButton } from '@clerk/nextjs';

import { LogoMark } from '@/components/brand/Logo';
import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-xl sm:px-8">
      <MobileNav />
      <Link href="/dashboard" className="lg:hidden" aria-label="Dashboard">
        <LogoMark className="size-7" />
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <Link href="/vods/new" className="btn-ghost hidden py-2 sm:inline-flex">
          <Plus size={16} /> New VOD review
        </Link>
        <SignedIn>
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'size-9 ring-2 ring-primary/40' } }} />
        </SignedIn>
      </div>
    </header>
  );
};

export default Navbar;
