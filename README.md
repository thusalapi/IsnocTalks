# IsnocTalks

A coaching platform for gamers: live video coaching, VOD reviews with on-screen drawing, courses and community.

- Roadmap: [PLAN.md](./PLAN.md)
- Progress: [STATUS.md](./STATUS.md)

## Stack

Next.js 14 (App Router), TypeScript, Tailwind, Clerk (auth), Stream Video (calls), Postgres with Prisma.

## Getting started

1. Copy `.env.example` to `.env.local` and fill in the keys, including `DATABASE_URL`.
2. `npm install`
3. `npm run db:push` to create the database tables.
4. `npm run dev` and open http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run db:push` | Sync `prisma/schema.prisma` to the database |
| `npm run db:studio` | Open Prisma Studio to browse data |
