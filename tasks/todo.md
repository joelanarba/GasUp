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
- [ ] Student: place order (hostel/block/room, cylinder size, instructions) → fee computed
- [ ] Status machine: PENDING→ACCEPTED→VERIFYING→ON_THE_WAY→DELIVERED→COMPLETED (+CANCELLED/DISPUTED)
- [ ] Supplier: see incoming, accept/reject, advance status
- [ ] Order history for student

## Phase 4 — Differentiator 1: Predictive refill
- [ ] Burn-rate calc: from a student's delivered orders, compute avg days-between-refills;
      before 2nd refill, fall back to base_burn × householdSize
- [ ] Gas-gauge component + "≈N days left" nudge on student dashboard
- [ ] Recharts consumption curve

## Phase 5 — Differentiator 2: Verified-fill trust
- [ ] Supplier uploads filled kg + proof image at VERIFYING step
- [ ] Student confirms weight matches → ON_THE_WAY; mismatch → DISPUTED
- [ ] Trust badge / dispute surfaced to admin

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
