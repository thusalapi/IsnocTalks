import { ReactNode } from 'react';

import AssistantWidget from '@/components/assistant/AssistantWidget';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const HomeLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-radial-fade" />
        <Navbar />
        <main className="relative flex-1 px-4 pb-12 pt-6 sm:px-8 lg:pt-8">
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
      {process.env.ANTHROPIC_API_KEY ? <AssistantWidget /> : null}
    </div>
  );
};

export default HomeLayout;
