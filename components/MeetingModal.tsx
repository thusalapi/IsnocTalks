'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '@/lib/utils';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  handleClick?: () => void;
  buttonText?: string;
  image?: string;
  buttonIcon?: string;
}

const MeetingModal = ({
  isOpen,
  onClose,
  title,
  className,
  children,
  handleClick,
  buttonText,
  image,
  buttonIcon,
}: MeetingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex w-full max-w-[480px] flex-col gap-6 rounded-2xl border border-line bg-surface px-6 py-8 text-ink shadow-glow">
        <div className="flex flex-col gap-5">
          {image && (
            <div className="flex justify-center">
              <div className="flex-center size-16 rounded-2xl border border-success/40 bg-success/10">
                <Image src={image} alt="" width={36} height={36} />
              </div>
            </div>
          )}
          <h2 className={cn('h-display text-2xl', className)}>{title}</h2>
          {children}
          <button className="btn-primary w-full py-3" onClick={handleClick}>
            {buttonIcon && <Image src={buttonIcon} alt="" width={14} height={14} />}
            {buttonText || 'Schedule session'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingModal;
