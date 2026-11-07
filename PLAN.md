# IsnocTalks Product Plan

## Vision

IsnocTalks is a coaching platform for gamers. A coach can review a student's gameplay, draw on it to show mistakes, run live sessions, sell courses and host a community. All of this lives in one app.

## Current base (as of Nov 2026)

The repo started as a Zoom-style video app.

| Area | Tool | State |
| --- | --- | --- |
| Framework | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui | Working |
| Auth | Clerk | Working |
| Live video | Stream Video SDK (calls, recordings, scheduling) | Working |
| Database | Postgres + Prisma | Added in Phase 1 |
| Deploy | Dockerfile, standalone output | Working |

## Tech decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| Database | Postgres (Neon or Supabase free tier) with Prisma | Relational data such as courses, lessons, orders and enrolments fits SQL well. Prisma gives typed queries. |
| Auth | Keep Clerk | Already wired in. A `User` row is created in Postgres the first time a Clerk user touches the database. |
| Live calls | Keep Stream Video | Already wired in. Its custom events carry live drawing strokes in Phase 3. |
| Payments | Lemon Squeezy (Paddle as fallback) | Both act as merchant of record, work for a Sri Lankan seller and handle global sales tax. Stripe does not onboard Sri Lankan merchants directly. |
| Video storage | Phase 1 uses links (YouTube or direct video URL). Phase 2 adds uploads to Cloudflare R2 or UploadThing. | Links ship fastest. Uploads need storage cost planning. |
| Drawings | Stored as vector JSON with coordinates from 0 to 1 | Drawings stay aligned at any player size and stay small in the database. |

## Roles

- **Coach**: creates VOD reviews, runs sessions, publishes courses, moderates the community.
- **Student**: submits VODs, books sessions, buys courses, joins the community.
- **Admin**: the platform owner. Approves coaches and handles payouts.

Phase 1 keeps roles simple. Every user can create a review, and the owner of a review can annotate it.

## Phases

### Phase 1: Foundation and VOD review MVP
1. Add Prisma, the Postgres connection and Clerk-to-database user sync.
2. Add the VOD library page (`/vods`) listing a user's reviews.
3. Add a "new review" form that takes a title, game and video link (YouTube or .mp4/.webm).
4. Build the review room (`/vods/[id]`) with:
   - a player that supports YouTube and direct video files,
   - a drawing layer over the video with pen, arrow, line, rectangle, circle and text tools, colours, undo and clear,
   - timestamped notes, each holding its drawing,
   - a timeline with markers that jump to each note,
   - drawings that appear automatically when playback reaches their timestamp.
5. Add a share link so a student can watch the review in read-only mode.

### Phase 2: Better reviews
1. Upload VOD files to cloud storage (R2 or UploadThing).
2. Student submits a VOD to a coach with questions. The coach gets a review queue.
3. Comment threads on each note so the student can reply.
4. Slow-motion playback, frame stepping and keyboard shortcuts.
5. Export a review as a rendered video with drawings burned in (later, server-side).

### Phase 3: Live coaching with screen drawing
1. In a Stream call, a coach can turn on "Draw mode" over the student's shared screen.
2. Strokes are sent to every participant through Stream custom events and drawn on a matching overlay.
3. Strokes fade after a few seconds, with a "pin" option to keep them.
4. Session booking: coaches set availability and price. Students book and pay.
5. Saved session recordings open in the VOD review room.

### Phase 4: Courses
1. Course builder: course, modules, lessons (video, text, quiz).
2. Course landing pages and a public catalogue.
3. Checkout through Lemon Squeezy. A webhook creates an `Enrollment`.
4. Lesson player with progress tracking.
5. Free preview lessons and coupons.

### Phase 5: Community
1. Spaces (channels) per game or per coach.
2. Posts with images, clips and comments, plus reactions.
3. Member-only spaces unlocked by a course or subscription.
4. Notifications and email digests.
5. Moderation tools (pin, delete, ban, report).

### Phase 6: Business and polish
1. Coach profiles, ratings and reviews.
2. Subscriptions (monthly membership).
3. Analytics for coaches (sales, students, watch time).
4. Coach payouts if the platform hosts more than one coach.
5. Mobile layout pass, SEO and landing page.

## Data model outline

Phase 1 tables are built. Later tables are sketched here so the schema grows cleanly.

- `User` (clerkId, name, imageUrl, role)
- `Vod` (owner, title, game, videoUrl, source, shareId, visibility)
- `VodAnnotation` (vod, author, timestamp, duration, note, shapes JSON)
- Later: `CoachProfile`, `Session`, `Booking`, `Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `Order`, `Space`, `Post`, `Comment`, `Reaction`, `Notification`

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk auth |
| `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_SECRET_KEY` | Stream video |
| `NEXT_PUBLIC_BASE_URL` | Base URL for share links |
| `DATABASE_URL` | Postgres connection (new in Phase 1) |
| Later: `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET`, storage keys | Payments and uploads |
