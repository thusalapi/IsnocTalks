import {
  CalendarClock,
  Clapperboard,
  GraduationCap,
  History,
  LayoutDashboard,
  MessagesSquare,
  Radio,
  ScanEye,
  type LucideIcon,
} from 'lucide-react';

export type NavLink = { label: string; route: string; icon: LucideIcon; soon?: boolean };

export const navGroups: { title: string; links: NavLink[] }[] = [
  {
    title: 'Train',
    links: [
      { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
      { label: 'VOD Reviews', route: '/vods', icon: ScanEye },
    ],
  },
  {
    title: 'Sessions',
    links: [
      { label: 'Coaching Room', route: '/personal-room', icon: Radio },
      { label: 'Upcoming', route: '/upcoming', icon: CalendarClock },
      { label: 'Previous', route: '/previous', icon: History },
      { label: 'Recordings', route: '/recordings', icon: Clapperboard },
    ],
  },
  {
    title: 'Grow',
    links: [
      { label: 'Courses', route: '/courses', icon: GraduationCap },
      { label: 'Community', route: '/community', icon: MessagesSquare },
    ],
  },
];

export const sidebarLinks = navGroups.flatMap((g) => g.links);

export const avatarImages = [
  '/images/avatar-1.jpeg',
  '/images/avatar-2.jpeg',
  '/images/avatar-3.png',
  '/images/avatar-4.png',
  '/images/avatar-5.png',
];

export const GAMES = [
  'Valorant',
  'CS2',
  'League of Legends',
  'Dota 2',
  'Apex Legends',
  'Fortnite',
  'Overwatch 2',
  'Rocket League',
  'PUBG',
  'Marvel Rivals',
];
