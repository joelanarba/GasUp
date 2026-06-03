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
- [ ] On new PENDING order, find other PENDING in same (hostel, block) within window
- [ ] Create/join Pool, apply discounted feeGhs, show pooled savings to student
- [ ] Supplier sees pool as one multi-stop trip

## Phase 7 — Live services (wrappers + audit)
- [ ] `lib/services/email.ts` (Resend), `sms.ts` (mNotify), `payments.ts` (Paystack test)
- [ ] Paystack init + verify webhook; order.paymentStatus transitions
- [ ] Notifications fire on key status changes; all logged to ServiceLog; graceful failure

## Phase 8 — Tracking sim + admin reports
- [ ] Leaflet map animating rider marker hostel→station→hostel (simulated)
- [ ] Admin: users, suppliers, orders tables; reports (orders, completed, top suppliers,
      revenue, pooling rate) with Recharts

## Phase 9 — Ship
- [ ] README with local + deploy steps
- [ ] Deploy to Vercel + Neon; seed prod; verify public URL end-to-end
- [ ] Fill the Review section below

## Review
_TBD — summarize what was built, what's mocked, known gaps._
