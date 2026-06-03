# GasUp — Build Plan

Build in phases. STOP at the checkpoint after Phase 2 and prove the skeleton runs before
layering the differentiators. Mark items `[x]` as completed and add a short note.

## Phase 0 — Scaffold
- [x] `create-next-app` (TypeScript, App Router, Tailwind, src dir, ESLint) — Next 14.2.35
- [x] Install: prisma @prisma/client next-auth bcryptjs zod + shadcn-style UI primitives
      (cva/clsx/tailwind-merge/lucide/radix). NOTE: omitted @auth/prisma-adapter (not needed
      for credentials+JWT). resend/recharts/leaflet deferred to their phases.
- [x] schema.prisma → `prisma/`; `.env` filled (DB live, Resend live, others placeholder);
      generated NEXTAUTH_SECRET; relocated todo/lessons → `tasks/`
- [x] `npx prisma migrate dev --name init` — applied clean against Neon (pooled URL worked)
- [x] Commit to a fresh Git repo

## Phase 1 — Data + seed
- [x] Verify schema migrates clean against Neon
- [x] Seed script: 1 admin, 3 halls × 2 blocks (6 rows), 3 suppliers (varied
      pricePerKg + ratings), 5 students with 1–2 historical DELIVERED orders each
- [x] `npm run seed` works idempotently (re-ran; counts stable: 9 users/6 hostels/3 suppliers/9 orders)

## Phase 2 — Auth + role dashboards (SKELETON)
- [x] NextAuth credentials provider + bcrypt; session carries role (JWT strategy)
- [x] Middleware route protection by role (verified via curl: cross-role → own dash; logged-out → /login)
- [x] Student self-registration page (+ /api/register: 201/409/400 verified)
- [x] Empty-but-routed dashboards for STUDENT / SUPPLIER / ADMIN (admin shows real seeded counts)
- [x] **CHECKPOINT: dev server runs; logged in as all 3 roles + new registration, routing proven. Awaiting sign-off.**

## Phase 3 — Order lifecycle
- [x] Student: place order (size + supplier pick, room from profile, instructions) → fee computed
      (kg×pricePerKg + GHS10 delivery; verified 6kg×14+10=94). POST /api/orders.
- [x] Status machine in `src/lib/order-status.ts` (single source of truth + role guards).
      Phase-3 path PENDING→ACCEPTED→ON_THE_WAY→DELIVERED→COMPLETED (+CANCELLED). VERIFYING/DISPUTED
      reserved for Phase 5 (the transition map already knows them). deliveredAt set on DELIVERED.
- [x] Supplier: incoming queue + accept/reject + advance (PATCH /api/orders/[id], ownership-checked).
- [x] Order history for student (list + detail w/ status timeline) + rating on COMPLETED
      (POST /api/orders/[id]/review, updates supplier ratingAvg/Count).
- [x] VERIFIED via curl: full lifecycle place→accept→advance→advance→complete→rate; guards
      (cross-role action 409, cross-supplier 403, duplicate review 409); all pages 200; build clean.

> Deferred to their phases: VERIFYING/weight (Phase 5), Paystack payment (Phase 7 — orders are UNPAID now).

## Phase 4 — Differentiator 1: Predictive refill
- [x] Burn-rate calc in `src/lib/prediction.ts` (avg days-between-refills × fill size;
      <2 refills → base_burn 0.18kg/day × householdSize). Unit-checked + verified on real seed data.
- [x] Gas-gauge SVG component + "≈N days left" nudge + level-based copy on student dashboard.
- [x] Recharts consumption curve (Area) with a "today" reference line. Build clean; pages 200.

## Phase 5 — Differentiator 2: Verified-fill trust
- [x] Status machine now inserts VERIFYING (ACCEPTED→VERIFYING→ON_THE_WAY). Supplier submits
      filled kg + optional downscaled proof photo via POST /api/orders/[id]/verify (stored as
      a small data URL — deploy-safe, no object storage).
- [x] Student confirms (→ON_THE_WAY, weightConfirmed=true) or reports mismatch (→DISPUTED)
      on the order detail; verified-fill panel shows ordered-vs-filled + photo.
- [x] Disputes surfaced on the admin dashboard (Trust & disputes card) + Confirmed/Awaiting/Disputed badges.
- [x] VERIFIED via curl: verify→confirm→complete (proof stored) and verify→dispute→DISPUTED;
      guards (confirm-before-verify, verify-when-not-ACCEPTED). Build clean; admin shows dispute.

## Phase 6 — Differentiator 3: Pooled refills
- [x] On new PENDING order, `src/lib/pooling.ts` finds same-supplier + same-hostel-block
      PENDING orders within a 90-min window.
- [x] Create/join Pool, re-price ALL pool members to the pooled delivery fee (GHS 5 vs 10),
      show pooled-savings banner on the student order detail.
- [x] Supplier sees pooled orders flagged "Pooled · N stops" (one multi-stop trip).
- [x] VERIFIED via curl: 2nd same-block order auto-pools (both re-priced 94→89, 2 stops);
      different hostel+supplier order stays solo (109). Seed: kofi shares Akua's block for the demo.

## Phase 7 — Live services (wrappers + audit)
- [x] `lib/services/{log,email(Resend),sms(mNotify),payments(Paystack)}.ts` — every call
      wrapped, audited to ServiceLog, and degrades gracefully (never throws into the flow).
- [x] Paystack init (/api/orders/[id]/pay) + verify webhook (HMAC SHA512 sig check) +
      /payment/callback reconcile; paymentStatus UNPAID→PENDING→PAID. PayButton on order detail.
- [x] Notifications fire on placed/accepted/verifying/on_the_way/delivered → email + SMS; all
      logged. Admin "Service activity" panel shows the audit trail.
- [x] VERIFIED on a clean single dev server: order still places (201) despite SMS placeholder;
      Paystack init returned a real checkout URL; webhook bad-sig → 401; audit trail populated
      (resend/mnotify/paystack rows). See lessons.md re: dev-server / .next / Neon pitfalls.

## Phase 8 — Tracking sim + admin reports
- [x] Leaflet map (OSM tiles) animating a rider marker depot↔hostel (eased, simulated);
      shows on the student order detail when ON_THE_WAY. Loaded via next/dynamic ssr:false.
- [x] Admin reports (Recharts): orders-by-status bar, top-suppliers bar, pooling-rate donut;
      plus suppliers table + recent-orders table. Stats + revenue already on the dashboard.
- [x] VERIFIED: ON_THE_WAY order shows "Live tracking"; admin renders all charts/tables (200).

## Phase 9 — Ship
- [x] README with overview, 3 differentiators, env table, seeded logins, demo path, deploy steps.
- [x] Deploy-ready: build runs `prisma generate && next build`; `postinstall` generates client;
      `db:deploy` script for prod migrate. Vercel + Paystack-webhook steps documented.
- [~] Actual Vercel deploy + prod seed + public-URL check — **needs the user's Vercel login**
      (can't auth on their behalf). Everything else is prepared.
- [x] Review section filled below.

## Review

**Built (Phases 0–8, all verified via curl + builds, committed per phase):**
- Scaffold, Neon+Prisma schema/migration, idempotent seed.
- Auth (NextAuth credentials/JWT, 3 roles) + middleware role-gating; student self-registration.
- Order lifecycle with a single-source-of-truth status machine + role guards; pricing; history; rating.
- **Differentiator 1 — prediction:** burn-rate engine, gas-gauge, consumption curve.
- **Differentiator 2 — trust:** VERIFYING step, supplier weight + proof photo, student confirm/dispute,
  admin dispute surfacing.
- **Differentiator 3 — pooling:** same-supplier/same-block auto-pool within 90 min, re-priced delivery
  fee, savings banner, supplier multi-stop flag.
- Live services: Resend/mNotify/Paystack wrappers, ServiceLog audit, graceful degradation,
  Paystack init+webhook+callback, notifications on status changes.
- Simulated Leaflet tracking; admin Recharts reports + tables + service audit panel.

**Mocked:** delivery tracking only (rider marker is simulated; real fleet GPS needs devices).

**Known gaps / next:** final Vercel deploy pending the user's login; SMS only sends if a real
mNotify key is set (degrades gracefully otherwise); proof photos stored as small data URLs
(fine for the demo; object storage would be the production choice).
