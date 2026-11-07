# IsnocTalks Status

Last updated: 6 November 2026. See [PLAN.md](./PLAN.md) for the full roadmap.

## Summary

| Phase | Scope | State |
| --- | --- | --- |
| 0 | Video calls, scheduling, recordings (existing app) | Done |
| 1 | Database foundation and VOD review MVP | Built. Needs a database and a browser test on your machine. |
| 2 | VOD uploads, student submissions, comment threads | Not started |
| 3 | Live drawing over screen share, session booking | Not started |
| 4 | Courses and checkout (Lemon Squeezy) | Not started |
| 5 | Community spaces | Not started |
| 6 | Profiles, subscriptions, analytics | Not started |

## Phase 1 checklist

- [x] Prisma with Postgres (`prisma/schema.prisma`): `User`, `Vod`, `VodAnnotation`
- [x] Clerk-to-database user sync on first use (`lib/db/user.ts`)
- [x] Server actions for reviews and notes (`actions/vod.actions.ts`), with input validation through zod
- [x] VOD library page `/vods` and the "VOD Reviews" sidebar link
- [x] New review form `/vods/new` (YouTube link or direct .mp4/.webm link)
- [x] Review room `/vods/[id]`
  - [x] One player wrapper for YouTube and video files with custom controls
  - [x] Drawing tools: pen, arrow, line, rectangle, circle, text. Six colours, three sizes, undo, clear.
  - [x] Timestamped notes holding a drawing, a text note and a display length
  - [x] Timeline with clickable note markers and scrubbing
  - [x] "Stop at notes" auto-pause, speeds from 0.25x to 2x, frame stepping
  - [x] Keyboard shortcuts (Space, arrows, comma/full stop, N, tool keys, Ctrl+Z, Esc)
- [x] Share by link: read-only public page `/review/[shareId]`
- [x] Production build, type check and lint pass
- [x] Drawing, saving the draft, auto-pause and seeking tested in a headless browser with a test clip
- [x] Neon Postgres connected (project "IsnocTalks", AWS US East 2) and tables created
- [ ] Test end to end in your browser (create, annotate, save, share)
- [ ] Test YouTube playback in a normal browser (the cloud test browser is blocked by YouTube)

## Setup steps on your machine

1. `DATABASE_URL` and `DIRECT_URL` are already in `.env.local` and the tables exist on Neon.
2. Check that `NEXT_PUBLIC_BASE_URL` is your site address (for example `http://localhost:3000`). Share links use it.
3. Run `npm install`. This also runs `prisma generate`.
4. Run `npm run dev` and open `/vods`.
5. After any change to `prisma/schema.prisma`, run `npm run db:push`.

## Known limits

- VODs are links only. File upload arrives in Phase 2.
- A direct video link must allow playback from other sites. Most cloud storage links work. Some hosts block it.
- Twitch VODs are not supported yet. The Twitch embed API can be added to the player wrapper later.
- Everyone can create reviews for now. Coach and student roles exist in the schema and are enforced from Phase 2.
- Drawings sit on a 16:9 frame. Clips with another shape show black bars, and drawings still line up.

## Next up (Phase 2)

1. File uploads to Cloudflare R2 or UploadThing.
2. Coach roles and a "submit VOD to coach" flow with a review queue.
3. Student replies on each note.
4. Select-and-move or delete single shapes inside a drawing.

## Change log

- **2026-11-07**: Connected Neon Postgres, created the tables, made the db scripts read `.env.local`.
- **2026-11-06**: Added PLAN.md and STATUS.md. Added Prisma and Postgres. Built the VOD review MVP (library, new review form, review room with drawing and timestamped notes, share link).
