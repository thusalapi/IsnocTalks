import Link from 'next/link';
import Image from 'next/image';

import { LogoMark } from '@/components/brand/Logo';

interface AlertProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: AlertProps) => {
  return (
    <section className="flex-center min-h-screen w-full bg-bg bg-grid p-4">
      <div className="card w-full max-w-[460px] p-8 text-center shadow-glow">
        <div className="flex-center mb-5">
          {iconUrl ? <Image src={iconUrl} width={64} height={64} alt="" /> : <LogoMark className="size-14" />}
        </div>
        <p className="font-display text-xl font-semibold">{title}</p>
        <Link href="/dashboard" className="btn-primary mt-6 w-full py-3">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
};

export default Alert;
