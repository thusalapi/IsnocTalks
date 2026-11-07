import { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Chakra_Petch, Inter } from 'next/font/google';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import 'react-datepicker/dist/react-datepicker.css';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });

export const metadata: Metadata = {
  title: { default: 'IsnocTalks | Pro gaming coaching', template: '%s | IsnocTalks' },
  description:
    'Get coached by better players. Live 1:1 sessions, VOD reviews with on-screen drawing, courses and a community built for competitive gamers.',
};

export const viewport: Viewport = { themeColor: '#07070D' };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={{
        layout: { socialButtonsVariant: 'iconButton' },
        variables: {
          colorPrimary: '#8B5CF6',
          colorBackground: '#0E0E18',
          colorInputBackground: '#151524',
          colorInputText: '#ECECF6',
          colorText: '#ECECF6',
          colorTextSecondary: '#8C8FAB',
          colorNeutral: '#ECECF6',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-inter)',
        },
        elements: {
          card: 'border border-line shadow-glow',
          footer: 'bg-surface',
        },
      }}
    >
      <html lang="en" className={`${inter.variable} ${display.variable}`}>
        <body>
          <Toaster />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
