'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserPlus } from 'lucide-react';

import { joinSpace, leaveSpace } from '@/actions/community.actions';
import { useToast } from '@/components/ui/use-toast';

export default function JoinButton({ spaceId, joined, canLeave }: { spaceId: string; joined: boolean; canLeave: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, start] = useTransition();
  if (joined && !canLeave) return null;

  return (
    <button
      disabled={pending}
      className={joined ? 'btn-ghost' : 'btn-primary'}
      onClick={() =>
        start(async () => {
          try {
            await (joined ? leaveSpace(spaceId) : joinSpace(spaceId));
            toast({ title: joined ? 'You left the space' : 'Welcome to the space' });
            router.refresh();
          } catch (e) {
            toast({ title: e instanceof Error ? e.message : 'Something went wrong', variant: 'destructive' });
          }
        })
      }
    >
      {joined ? <LogOut size={15} /> : <UserPlus size={15} />}
      {joined ? 'Leave' : 'Join space'}
    </button>
  );
}
