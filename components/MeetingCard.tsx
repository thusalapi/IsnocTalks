'use client';

import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Copy, Play } from 'lucide-react';

import { avatarImages } from '@/constants';
import { useToast } from './ui/use-toast';

interface MeetingCardProps {
  title: string;
  date: string;
  icon: LucideIcon;
  isPreviousMeeting?: boolean;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

const MeetingCard = ({ icon: Icon, title, date, isPreviousMeeting, handleClick, link, buttonText }: MeetingCardProps) => {
  const { toast } = useToast();

  return (
    <section className="card card-hover flex min-h-[220px] w-full flex-col justify-between gap-6 p-6">
      <div className="flex items-start gap-4">
        <span className="flex-center size-11 shrink-0 rounded-xl border border-primary/30 bg-primary-soft text-primary">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{date}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex -space-x-2.5">
          {avatarImages.slice(0, 4).map((img) => (
            <Image key={img} src={img} alt="" width={34} height={34} className="rounded-full ring-2 ring-surface" />
          ))}
          <span className="flex-center size-[34px] rounded-full bg-surface-3 text-xs font-semibold ring-2 ring-surface">
            +5
          </span>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <button onClick={handleClick} className="btn-primary">
              <Play size={14} /> {buttonText}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({ title: 'Link copied' });
              }}
              className="btn-ghost"
            >
              <Copy size={14} /> Copy link
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MeetingCard;
