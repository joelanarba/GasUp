# GasUp 🔥

Campus LPG (cooking gas) delivery for the University of Cape Coast — built around a
**retention + trust layer**, not just delivery matching. Three differentiators:

1. **Predictive refill** — forecasts when you'll run low from your own refill history
   (days-between-refills × fill size × household size) and nudges you *before* the
   cylinder runs dry. Gas-gauge + "≈N days left" + consumption curve.
2. **Verified-fill trust** — the supplier submits the filled weight (+ a scale photo) and
   the student confirms it matches on delivery. A mismatch raises a **DISPUTED** flag.
   Kills the under-filling / cylinder-swap fear of the manual market.
3. **Pooled hostel refills** — two PENDING orders from the same supplier to the same
   hostel block within a 90-min window bundle into one rider trip at a lower delivery fee:
   **lower student price AND higher rider earnings per trip.**

## Stack

- **Next.js 14** (App Router, TypeScript) — one codebase, UI + API routes
- **PostgreSQL (Neon) + Prisma** — prediction & pooling are relational/aggregate queries
- **NextAuth** (credentials, JWT) — roles STUDENT / SUPPLIER / ADMIN
- **Resend** (email · live), **mNotify** (SMS · Ghana), **Paystack** (payments · TEST mode)
- **shadcn-style UI + Tailwind**, **Recharts** (gauge curve + admin reports),
  **Leaflet + OpenStreetMap** (simulated delivery tracking)
- Deploy: **Vercel** + **Neon**

All external calls go through `src/lib/services/*` wrappers that log every call to the
`ServiceLog` table and **degrade gracefully** — a dead SMS/payment API can never crash the
order flow.

## Local setup

```bash
npm install
cp .env.example .env     # then fill the values (see below)
npx prisma migrate dev --name init
npm run seed             # admin, hostels, suppliers, students w/ refill history
npm run dev              # http://localhost:3000
```

### Environment variables (`.env`)

| Var | What | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon Postgres connection string | required |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | NextAuth | `openssl rand -base64 32`; URL = site origin |
| `RESEND_API_KEY` / `EMAIL_FROM` | Email | degrades gracefully if unset |
| `MNOTIFY_API_KEY` / `MNOTIFY_SENDER_ID` | SMS (Ghana) | degrades gracefully if unset |
| `PAYSTACK_SECRET_KEY` / `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Payments | **TEST keys only** |
| `NEXT_PUBLIC_APP_URL` | Site origin | used for payment callbacks + email links |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login | used by the seed script |

### Seeded demo logins (after `npm run seed`)

- **Admin** — `admin@gasup.app` / `ChangeMe123!` (or your `ADMIN_*`)
- **Suppliers** — `swiftgas@gasup.app`, `campusgas@gasup.app`, `flamefuel@gasup.app`
- **Students** — `akua@gasup.app`, `kofi@gasup.app`, `esi@gasup.app`, `nana@gasup.app`, `yaa@gasup.app`
- All non-admin passwords: `Password123!`  · _kofi shares Akua's hostel block to demo pooling._

## The demo path

1. Student signs up / logs in → dashboard shows the **gas-gauge prediction**.
2. Places a refill → picks a supplier → (Paystack test card) → email/SMS fire.
3. Supplier accepts → **uploads fill weight** → student **confirms** → tracked (map) to DELIVERED.
4. Two same-block orders **auto-pool** at a reduced fee.
5. Student **rates** the delivery.
6. Admin sees orders, suppliers, disputes, the service audit trail, and **Recharts reports**.

## Deploy (Vercel + Neon)

1. Push this repo to GitHub and **import it into Vercel**.
2. Add every env var above to the Vercel project (set `NEXTAUTH_URL` and
   `NEXT_PUBLIC_APP_URL` to your `https://<app>.vercel.app` URL).
3. Build runs `prisma generate && next build` automatically. After the first deploy, run
   the migration + seed against the prod DB:
   ```bash
   npx prisma migrate deploy     # or: npm run db:deploy
   npm run seed
   ```
4. In the **Paystack dashboard**, set the webhook URL to
   `https://<app>.vercel.app/api/payments/webhook`.

## What's mocked

Only **delivery tracking** — the rider marker is simulated (real fleet GPS needs physical
devices). Everything else (auth, orders, prediction, trust, pooling, email, SMS, Paystack
init/verify/webhook) is real.

## Project docs

- `CLAUDE.md` — project context + guardrails
- `tasks/todo.md` — phased build log · `tasks/lessons.md` — pitfalls learned
