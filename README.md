# Archetype Lab (Next.js + Prisma + Razorpay)

1. `.env` is included and uses a local SQLite file, so no database install is needed. Add your Razorpay test keys to enable payments.
2. `npm install` then `npx prisma db push`
3. `npm run dev`

How it works
- Answers are scored on the server. Each result is a row in `Result` (that row count is the real "people took this test" counter).
- `GET /api/results/[id]` returns only the free report. Flaws, careers, relationships, work-on and trait breakdown are attached only when `paid = true`.
- Payment: `/api/checkout` creates a Razorpay order, `/api/verify` checks Razorpay's HMAC signature with your secret and only then sets `paid = true`.
- Hardening to add before launch: a Razorpay webhook (`payment.captured`) so payments still unlock if the user closes the tab, rate limiting on `/api/results`, and refund/terms pages.
- Edit questions and archetypes in `lib/data.ts`. Brand name is in `app/layout.tsx`.

Production: change `provider` in `prisma/schema.prisma` to `"postgresql"`, set DATABASE_URL to Postgres, and run `npx prisma db push`.
