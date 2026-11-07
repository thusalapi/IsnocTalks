import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import {
  ArrowRight,
  CalendarCheck,
  ChevronDown,
  GraduationCap,
  MessagesSquare,
  PenTool,
  Radio,
  ScanEye,
  Share2,
  Target,
  Trophy,
  Upload,
  Users,
} from 'lucide-react';

import Logo from '@/components/brand/Logo';
import HeroMock from '@/components/landing/HeroMock';
import { GAMES } from '@/constants';

export const metadata = { title: { absolute: 'IsnocTalks | Pro gaming coaching' } };

const features = [
  {
    icon: Radio,
    title: 'Live 1:1 coaching',
    body: 'HD video calls with screen share. Your coach watches you play and talks you through it in real time.',
    tone: 'text-primary border-primary/30 bg-primary-soft',
  },
  {
    icon: ScanEye,
    title: 'VOD reviews you can see',
    body: 'Coaches pause on the exact frame, draw arrows and circles on your gameplay and leave timestamped notes.',
    tone: 'text-accent border-accent/30 bg-accent-soft',
  },
  {
    icon: GraduationCap,
    title: 'Courses',
    body: 'Structured lessons from coaches you trust, with progress tracking. Learn at your own pace between sessions.',
    tone: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    soon: true,
  },
  {
    icon: MessagesSquare,
    title: 'Community',
    body: 'Spaces for every game and every coach. Share clips, ask questions and find duo partners.',
    tone: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
    soon: true,
  },
];

const steps = [
  { icon: Upload, title: 'Send your gameplay', body: 'Drop a YouTube link to a match or book a live session.' },
  { icon: PenTool, title: 'Get it broken down', body: 'Your coach marks every mistake on screen with a fix for each one.' },
  { icon: Trophy, title: 'Climb', body: 'Practise the notes, come back with a new VOD and track the difference.' },
];

const faqs = [
  {
    q: 'Which games are supported?',
    a: 'Any game you can record. VOD reviews work with YouTube links and direct video files, so it does not matter what you play.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. Coaching calls and VOD reviews run in the browser. Students only need a link to watch a shared review.',
  },
  {
    q: 'Can I coach on IsnocTalks?',
    a: 'Yes. Create an account, start a coaching room and review your students’ VODs. Paid sessions and courses are on the way.',
  },
  {
    q: 'When do courses and community launch?',
    a: 'They are next on the roadmap. Sign up now and you will have access as soon as they go live.',
  },
];

function PrimaryCta({ className = '' }: { className?: string }) {
  return (
    <>
      <SignedOut>
        <Link href="/sign-up" className={`btn-primary px-6 py-3 text-base ${className}`}>
          Start for free <ArrowRight size={18} />
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard" className={`btn-primary px-6 py-3 text-base ${className}`}>
          Open dashboard <ArrowRight size={18} />
        </Link>
      </SignedIn>
    </>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-ink">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink-muted md:flex">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#how" className="hover:text-ink">How it works</a>
            <a href="#coaches" className="hover:text-ink">For coaches</a>
            <a href="#faq" className="hover:text-ink">FAQ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SignedOut>
              <Link href="/sign-in" className="btn px-3 text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <Link href="/sign-up" className="btn-primary py-2">
                Get started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn-primary py-2">
                Dashboard <ArrowRight size={16} />
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-grid opacity-70 mask-fade-b" />
        <div className="absolute inset-x-0 top-0 h-[520px] bg-radial-fade" />
        <div className="absolute -left-40 top-40 size-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
          <div>
            <span className="chip border-primary/40 bg-primary-soft text-ink">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-accent" />
              </span>
              Coaching platform for competitive gamers
            </span>
            <h1 className="h-display mt-6 text-5xl leading-[1.02] sm:text-6xl xl:text-7xl">
              Get coached.
              <br />
              <span className="text-gradient">See your mistakes.</span>
              <br />
              Rank up.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              IsnocTalks brings live 1:1 coaching, VOD reviews with on-screen drawing, courses and community into one
              place, so every session turns into real improvement.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PrimaryCta />
              <a href="#how" className="btn-ghost px-6 py-3 text-base">
                See how it works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
              <span className="flex items-center gap-2"><Target size={16} className="text-accent" /> Frame-by-frame breakdowns</span>
              <span className="flex items-center gap-2"><Users size={16} className="text-accent" /> 1:1 or team sessions</span>
            </div>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* Games marquee */}
      <section className="border-y border-line bg-surface/50 py-6">
        <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">Built for</span>
          {GAMES.map((g) => (
            <span key={g} className="font-display text-sm font-semibold text-ink-muted">
              {g}
            </span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container scroll-mt-20 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Everything in one place</p>
          <h2 className="h-display mt-3 text-4xl sm:text-5xl">Your whole coaching loop</h2>
          <p className="mt-4 text-ink-muted">
            Stop juggling Discord calls, screen recordings and spreadsheets. Run every part of coaching from one app.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {features.map(({ icon: Icon, title, body, tone, soon }) => (
            <div key={title} className="card card-hover relative overflow-hidden p-7">
              <div className="flex items-center justify-between">
                <span className={`flex-center size-12 rounded-xl border ${tone}`}>
                  <Icon size={22} />
                </span>
                {soon && <span className="chip border-accent/30 text-accent">Coming soon</span>}
              </div>
              <h3 className="h-display mt-6 text-2xl">{title}</h3>
              <p className="mt-2 text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative scroll-mt-20 border-y border-line bg-surface/40 py-24">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="h-display mt-3 text-4xl sm:text-5xl">From replay to rank-up</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="card relative p-7">
                <span className="absolute right-6 top-5 font-display text-5xl font-bold text-surface-3">0{i + 1}</span>
                <span className="flex-center size-12 rounded-xl bg-brand-gradient shadow-glow">
                  <Icon size={22} />
                </span>
                <h3 className="h-display mt-6 text-xl">{title}</h3>
                <p className="mt-2 text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Players vs coaches */}
      <section id="coaches" className="container scroll-mt-20 py-24">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card relative overflow-hidden p-8">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-accent/15 blur-3xl" />
            <p className="eyebrow">For players</p>
            <h3 className="h-display mt-3 text-3xl">Know exactly what to fix</h3>
            <ul className="mt-6 flex flex-col gap-3 text-ink-soft">
              {[
                'Reviews drawn on your own gameplay',
                'Notes that jump to the exact second',
                'Live sessions with screen share',
                'Rewatch recordings any time',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <ScanEye size={16} className="text-accent" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card relative overflow-hidden border-primary/40 p-8 shadow-glow">
            <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl" />
            <p className="eyebrow">For coaches</p>
            <h3 className="h-display mt-3 text-3xl">Run your coaching business</h3>
            <ul className="mt-6 flex flex-col gap-3 text-ink-soft">
              {[
                ['Personal coaching room with one invite link', Radio],
                ['Schedule sessions and share invites', CalendarCheck],
                ['Telestration tools for VOD breakdowns', PenTool],
                ['Share reviews with a private link', Share2],
              ].map(([t, I]) => {
                const Icon = I as typeof Radio;
                return (
                  <li key={t as string} className="flex items-center gap-3">
                    <Icon size={16} className="text-primary" /> {t as string}
                  </li>
                );
              })}
            </ul>
            <div className="mt-8">
              <PrimaryCta />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="container max-w-3xl scroll-mt-20 pb-24">
        <h2 className="h-display text-center text-4xl">Questions</h2>
        <div className="mt-10 flex flex-col gap-3">
          {faqs.map(({ q, a }) => (
            <details key={q} className="card group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold">
                {q}
                <ChevronDown size={18} className="text-ink-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-ink-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 p-10 text-center shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-brand-gradient opacity-25" />
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="relative">
            <h2 className="h-display text-4xl sm:text-5xl">Your next rank starts with one review</h2>
            <p className="mx-auto mt-4 max-w-xl text-ink-soft">
              Create a free account, upload a match and see your gameplay the way a coach sees it.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryCta />
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-sm text-ink-faint">© {new Date().getFullYear()} IsnocTalks. Built for players who want to get better.</p>
        </div>
      </footer>
    </div>
  );
}
