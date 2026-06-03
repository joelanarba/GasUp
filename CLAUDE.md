# CLAUDE.md — GasUp

> Read this fully at the start of every session. Then read `tasks/todo.md` for current
> progress and `tasks/lessons.md` for mistakes not to repeat.

## What this is

GasUp is a campus gas (LPG) delivery web app for an entrepreneurship course project at
the University of Cape Coast. Graded on TWO things equally:
1. A **working, deployed web app**.
2. **Business viability** — specifically the answer to "what makes this different and
   how does it make money."

So code quality AND the strategic differentiation both matter. Do not build a generic
Uber-for-gas clone — that is the failure mode this whole project exists to avoid.

## The core idea (do not lose this)

Anyone can build delivery-matching. The defensible, gradeable value-add is the
**retention + trust layer on top of delivery**, via three differentiators:

1. **Predictive refill** — forecast when a student will run out BEFORE they do, from
   their own refill history (days between refills × fill size × household size). Show a
   gas-gauge + "≈4 days left — refill now?" nudge. This is the headline feature.
2. **Verified-fill trust** — supplier uploads filled-weight proof (kg + photo); student
   confirms the weight matches on delivery; mismatch raises a DISPUTED flag. Kills the
   under-filling / cylinder-swap fear that plagues the current manual market.
3. **Pooled hostel refills** — when ≥2 PENDING orders share a hostel block within a time
   window, bundle them into one rider trip at a lower per-student fee. This is the
   unit-economics edge: lower student price AND higher rider earnings per trip.

When in doubt about a feature, ask: "does this strengthen prediction, trust, or pooling?"
If not, it's probably scope creep — defer it.

## Stack (fixed — do not substitute)

- **Next.js 14** App Router + TypeScript (one codebase, frontend + API routes)
- **PostgreSQL (Neon free tier) + Prisma** — chosen over Firebase ON PURPOSE: the
  prediction and pooling features are relational/aggregate queries (windowed
  days-between-refills, GROUP BY block). Firestore is bad at exactly this. Do NOT
  migrate to Firebase.
- **NextAuth** (credentials provider) — roles: STUDENT / SUPPLIER / ADMIN
- **Resend** — transactional email (LIVE)
- **mNotify** — SMS, Ghanaian provider (LIVE). https://readthedocs.mnotify.com
- **Paystack** — payments, TEST mode (real redirect + webhook flow, test cards)
- **shadcn/ui + Tailwind** — UI. Avoid generic AI aesthetics (see Design below)
- **Recharts** — admin reports + the prediction gauge/curve
- **Leaflet + OpenStreetMap** — delivery tracking SIMULATION (the only mocked piece;
  real fleet GPS needs physical devices). Free, no Google billing.
- Deploy: **Vercel** (app) + **Neon** (db)

## Hard rules for the LIVE external services

All three external services run live, so robustness is non-negotiable:
- Wrap every external call in `src/lib/services/{sms,email,payments}.ts`. Never call
  Paystack/Resend/mNotify SDKs directly from a route or component.
- Read all keys from env (see `.env.example`). Never hardcode keys. Never commit `.env`.
- **Graceful degradation**: a failed external call logs to the `ServiceLog` table and
  returns a handled error — it must NEVER crash the order flow. A dead SMS API during
  the demo cannot take down checkout.
- Log every external call (success or failure) to `ServiceLog` for an audit trail.
- Paystack stays in TEST mode. Never wire live payment keys.

## Roles & registration

- STUDENT: self-registers.
- SUPPLIER: admin-creates (matches the SRS). No supplier self-signup.
- ADMIN: seeded, not registerable.

## Design (this is half the grade)

Mobile-first responsive (students are on phones). It runs in a desktop browser too, which
satisfies any "desktop application" checkbox in the brief — but build it phone-first.
- Distinctive, not generic. No Inter/Roboto/Arial. No purple-gradient-on-white AI slop.
- Pick a cohesive aesthetic with a warm, trustworthy, Ghanaian-campus feel. An
  amber/flame accent suits "gas" and reads warm, not corporate. Commit to it via CSS vars.
- One well-orchestrated dashboard load (staggered reveals) beats scattered micro-anims.

## Working agreement (how to build)

- **Plan first.** Keep `tasks/todo.md` updated with checkable items. Check in with the
  user before starting a big new phase.
- **Checkpoint discipline.** Build in the phases in `tasks/todo.md`. After the skeleton
  phase (schema + auth + 3 dashboards routing), STOP and prove it runs before layering
  differentiators.
- **Verify before "done."** Never mark a task complete without proving it works — run the
  dev server, run the relevant flow, check it compiles. Would a staff engineer approve?
- **Simplicity first.** Smallest change that works. No temporary hacks; find root causes.
- **Capture lessons.** After any correction from the user, append the pattern to
  `tasks/lessons.md` so it doesn't recur.

## Commands

```bash
npm install
npx prisma migrate dev --name init   # after DATABASE_URL is set
npm run seed                          # seeds hostels, admin, sample suppliers + students
npm run dev                           # http://localhost:3000
```

## Definition of done (the demo must show)

1. Student signs up → sees dashboard with a gas-gauge prediction.
2. Student places a refill order → pays via Paystack test card → gets email + SMS.
3. Supplier accepts → uploads fill weight → student confirms → tracked to DELIVERED.
4. Two orders in the same block auto-pool and show a reduced fee.
5. Student rates the delivery.
6. Admin sees orders, suppliers, and a revenue/pooling report with charts.
7. Deployed and reachable on a public Vercel URL.
