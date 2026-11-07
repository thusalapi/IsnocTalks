# IsnocTalks

IsnocTalks is a coaching platform for competitive gamers. Coaches run live 1:1 sessions, break down gameplay with on-screen drawing, and (soon) sell courses and host a community, all in one app.

**Live site:** https://isnoc-talks.vercel.app

- Roadmap: [PLAN.md](./PLAN.md)
- Progress and known limits: [STATUS.md](./STATUS.md)

## Features

| Feature | Status |
| --- | --- |
| Live coaching calls with screen share, scheduling and recordings | Done |
| Personal coaching room with a reusable invite link | Done |
| VOD reviews: draw on gameplay (pen, arrow, line, box, circle, text), timestamped notes, auto-pause at notes, frame stepping | Done |
| Share a review with a read-only link | Done |
| Public landing page and dashboard | Done |
| Live drawing over a student's shared screen | Planned |
| Courses with checkout (Lemon Squeezy) | Planned |
| Community spaces | Planned |

## Tech stack

| Area | Tool |
| --- | --- |
| Framework | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Lucide icons, Chakra Petch and Inter fonts |
| Auth | Clerk |
| Live video | Stream Video SDK |
| Database | Postgres on Neon, Prisma ORM with the node-postgres adapter |
| Hosting | Vercel, deployed through GitHub Actions |

## Project structure

```
app/
  (marketing)/        Public landing page at /
  (auth)/             Sign in and sign up
  (root)/(home)/      Signed-in app: dashboard, VOD reviews, sessions, coaching room
  (root)/meeting/     Live call screens
  review/[shareId]/   Public read-only VOD review
actions/              Server actions (Stream tokens, VOD reviews)
components/           UI components (vod/, layout/, landing/, dashboard/, ui/)
lib/                  Database client, VOD helpers, URL helpers
prisma/schema.prisma  Database schema
```

## Getting started

Requirements: Node.js 22, a Neon (or other Postgres) database, a Clerk app and a Stream app.

1. Copy `.env.example` to `.env.local` and fill in the values.
2. Install dependencies. This also generates the Prisma client.
   ```bash
   npm install
   ```
3. Create the database tables.
   ```bash
   npm run db:push
   ```
4. Start the dev server and open http://localhost:3000.
   ```bash
   npm run dev
   ```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-in` and `/sign-up` |
| `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_SECRET_KEY` | Stream video |
| `DATABASE_URL` | Pooled Postgres URL, used by the app |
| `DIRECT_URL` | Direct Postgres URL, used for schema changes |
| `NEXT_PUBLIC_BASE_URL` | Site address, used as a fallback for share links |

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync `prisma/schema.prisma` to the database (reads `.env.local`) |
| `npm run db:studio` | Open Prisma Studio to browse data |

## Deployment

The GitHub Actions workflow in `.github/workflows/deploy.yml` deploys the app to Vercel.

- Every push and pull request runs lint and a type check.
- A pull request into `master` gets a preview deploy.
- A push to `master` deploys to production.

`vercel.json` turns off Vercel's own Git deploys, so each commit deploys once.

The workflow needs these repository secrets:

| Secret | Where to find it |
| --- | --- |
| `VERCEL_TOKEN` | https://vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Vercel team settings (`team_...`) |
| `VERCEL_PROJECT_ID` | Vercel project settings (`prj_...`) |

App environment variables live in the Vercel project settings. The workflow pulls them in during the build.
