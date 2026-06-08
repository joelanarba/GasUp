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

## Phase 10 — Post-MVP features (retention + monetization polish)
- [x] **GasUp Impact**: `src/lib/impact.ts` aggregates pooled-order savings (GHS 5/order) + trips
      reduced + estimated CO₂ (0.32kg/trip). ImpactCard headline on admin (when pooledOrders>0);
      student savings strip. Build clean; pure presentational over already-proven groupBy data.
- [x] **Proactive refill alerts** (Vercel Cron): `/api/cron/refill-alerts` (CRON_SECRET Bearer auth,
      `vercel.json` daily 08:00) emails/SMS students predicted ≤3 days left with no IN-FLIGHT order.
      VERIFIED live: empty-cylinder temp student → alerted:1 + recipient; all seeded students correctly
      skipped. FIX: DELIVERED excluded from in-flight suppression (it's completed-refill history, not
      gas-in-transit) — a stale un-confirmed delivery should still nudge.
- [x] **Supplier trust score**: `src/lib/trust.ts` composite = rating (0.7, prior 0.85) + verified-fill
      confirm rate (0.3, prior 0.9); `trust-data.ts` two groupBys. TrustBadge at supplier-pick,
      supplier dashboard, admin suppliers table. Build clean.
- [x] **Express refill** (premium tier): `express` Boolean on Order (migration `add_express`),
      +GHS 8 surcharge, supplier queue `orderBy [{express:desc},{createdAt:asc}]`, Zap badge,
      order-form toggle + fee line. VERIFIED live: express KG_6 order stored express=true,
      feeGhs=102 (84 gas + 10 delivery + 8 express); queue sorts express first.

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

## Phase 11 — Full audit + polish

Independent audit of the whole repo (every route/page/component/service verified, not trusting
phase markers). `tsc --noEmit` clean; live server pages 200; auth gating 307→/login verified.

- [x] **Admin supplier management** — `POST /api/admin/suppliers` (admin-only, zod, 401/403/400/409/201)
      + `AddSupplier` form on the admin dashboard. Closes the SRS "admin-creates suppliers" gap.
      No schema change (uses existing User+Supplier). VERIFIED via authed curl: guard 401, login,
      validation 400, duplicate 409, create 201, re-create 409 (persisted).
- [x] **Copy fixes:** removed stale "payment arrives in a later build" note from the order form
      (Paystack is live); aligned FAQ + suppliers-section trust tiers to the real labels
      (Excellent/Trusted/Fair/Watch, not Gold/Silver/Bronze); fixed FAQ payment phrasing.
- [x] **Supplier CTA fix:** landing "Become a supplier" pointed at `/register` (students only →
      silently made a student account). Now "Partner with us" (mailto), matching admin onboarding.
- [x] **Footer year** made dynamic.
- [x] **CRITICAL — DB schema drift (FIXED):** the Neon DB was stuck on `init`+`add_express`
      (old hostel/room model) while the code + `schema.prisma` use the address+lat/lng model — the
      refactor was never migrated, so a fresh Prisma client threw `P2022` (the running dev server
      masked it with a stale in-memory client). Generated `20260604174717_location_refactor`
      (drops Hostel + hostelId/roomNumber/block, adds address/lat/lng + defaultAddress/lat/lng),
      reset + reseeded the shared DB (user-approved), restarted the dev server fresh. VERIFIED:
      all three role dashboards now load 200 under auth (`/student` `/student/order` `/student/orders`
      `/supplier` `/admin`) where they previously 500'd. Migration committed so `migrate deploy`
      reproduces it on Vercel.
- [ ] (optional) Admin dispute resolution action; supplier availability toggle; pitch-deck artifact.

## Phase 12 — Enhancement sprint (retention + business-viability polish)

Approved 2026-06-04 (brainstorm + 2 decisions: onboarding = a **separate setup step**;
DB = **additive nullable migration**). Strengthens prediction/trust/pooling for the demo
and the entrepreneurship grade. All reuses existing engines — no architecture changes.

- [x] **Migration `add_onboarding_prediction`** — User gains nullable `defaultCylinderSize`,
      `lastRefillAt`, `refillSnoozedUntil`. Verified additive (3 `ADD COLUMN`, no drops/reset);
      applied to Neon + committed so `migrate deploy` reproduces it on Vercel.
- [x] **Day-One prediction** — `estimateFromProfile()` reuses `computePrediction` (method
      "estimate"). `/student/setup` form → `POST /api/student/gas-profile`. Empty state → setup CTA.
      VERIFIED e2e: register→setup CTA→gas-profile(200)→dashboard shows "Estimated from your setup".
- [x] **Student savings card** — `SavingsCard` on `/student`: total saved (GHS 5×pooled, real),
      pooled orders, est. trips reduced (labeled), avg saved/refill; encouraging zero-state.
      VERIFIED both states (zero for new student; 3 tiles populated after akua pooled).
- [x] **Dynamic pooling breakdown** — `PoolSavings` (pool size / original / discount / you pay /
      saved) on order detail; "Pooled · saved GHS 5" badge on history; honest hint on order form.
      VERIFIED e2e: 2nd same-block order returned `pooled:true,savings:5`; breakdown + badge render.
- [x] **Smart refill actions** — prediction card (low/empty) → "Order refill" + "Remind me
      tomorrow" → `POST /api/student/refill-reminder` sets `refillSnoozedUntil`; cron respects it.
      VERIFIED: snooze(200)→dashboard shows "remind you tomorrow" + "Order now anyway".
- [x] **Landing roadmap** — static `RoadmapSection` ("Phase 2 Innovations", 5 coming-soon cards) +
      nav link. No backend, no schema. VERIFIED: all 5 items + pills render on `/`.
- [x] **Verify** — `tsc --noEmit` clean; `next build` passes (21 routes); `next lint` clean; e2e
      curl flows (day-one, pooling, snooze) all 200; no regressions (/ /login /supplier /admin 200;
      seeded student history-prediction intact). Test rows cleaned; idempotent re-seed re-run clean.

## Phase 13 — On-demand dispatch refactor (teammate feedback)

Five changes from teammate feedback. The headline is item 1: students stop picking a rider; orders
**broadcast** to a live rider dispatch board and the first rider to accept claims them. Work items in
order (1→5) — they build on each other. **Schema/migrations are grouped first with a checkpoint** (per
the working agreement: check in after migrations, before building UI on top of them).

**Decisions locked (user, 2026-06-06):**
- **Dispatch board geo →** add a nullable rider base location (`Supplier.lat/lng`); compute real
  haversine distance rider→order; sort available orders by distance then age; show ALL open campus
  orders (no hard coverage cutoff — campus is tiny).
- **Pool claim →** accepting any OPEN order in a pool atomically assigns ALL its OPEN members to that
  rider as one multi-stop trip (keeps the pooled-fee economics honest = genuinely one trip).

**Held constant (no change):** prediction engine (reads `verifiedWeightKg`/`deliveredAt`), trust layer,
Postgres+Prisma, `lib/services/*` wrappers + ServiceLog, mobile-first amber aesthetic. **Express tier
kept** (surcharge unchanged; on the board express sorts first, then distance, then age). The Prisma
model stays named `Supplier` internally — only user-facing copy changes to "Rider" (item 4).

### 13.0 — Schema + migrations (DONE ✅ — checkpoint signed off)
All additive/non-destructive — no DB reset needed (existing DELIVERED seed rows are unaffected).
Split into two migrations to dodge the PG "unsafe use of new enum value in same transaction" rule.
- [x] `OrderStatus`: added `OPEN`. Kept `PENDING` as legacy/no-op. (`supplierId` already nullable ✓.)
      NOTE: Prisma appended `OPEN` to the end of the PG enum (no `BEFORE` clause); harmless — lifecycle
      order is driven by `ORDER_TIMELINE` in code, nothing relies on the enum's internal sort.
- [x] `Supplier`: added nullable `lat`, `lng` (rider base location) + `partnerStation`.
- [x] New `PaymentMethod` enum `ONLINE | CASH_ON_DELIVERY`; `Order.paymentMethod` default `ONLINE`.
- [x] New `ApplicationStatus` enum + `RiderApplication` table.
- [x] Migration 1 `20260606124108_add_dispatch_open_and_extras` (additive, OPEN added not defaulted);
      Migration 2 `20260606124213_order_default_open` (`Order.status` default → OPEN). Both applied to
      Neon; client regenerated; `migrate status` → "Database schema is up to date!" (6 migrations).
- [x] **CHECKPOINT: migrations written + applied + verified — checking in with user before building UI.**

### 13.1 — Item 1: core order flow (students don't pick riders) — HEADLINE ✅
- [x] `pricing.ts`: `GAS_PRICE_PER_KG = 14` + `RIDER_CUT = 0.75`; `computeFee(kg, opts)` now uses the
      platform gas price (signature changed — dropped per-rider `pricePerKg`); `riderEarn({pooled})` helper.
- [x] `order-status.ts`: `accept` OPEN→ACCEPTED; `cancel` OPEN||ACCEPTED; `ORDER_TIMELINE[0]=OPEN`;
      `STATUS_META.OPEN = "Finding a rider"`; removed rider accept/reject from `availableActions` (board
      handles accept); dropped the `reject` action entirely.
- [x] `POST /api/orders`: creates `supplierId: null`, `status OPEN`, fee = platform gas + solo delivery.
- [x] `order-form.tsx` + `student/order/page.tsx`: rider list/`SupplierChoice` fully removed.
- [x] `pooling.ts`: pools by location + time only (no supplier); re-prices via `GAS_PRICE_PER_KG`. Extracted
      `distanceMeters`/`formatDistance` to new `src/lib/geo.ts` (shared with the board).
- [x] **Atomic claim** `POST /api/orders/[id]/accept`: `$transaction`, guarded `updateMany` (count→409 on
      race), claims all still-OPEN pool members. VERIFIED: 200 then 409; pool claim returned `claimed:2`.
- [x] `supplier/page.tsx` → **dispatch board**: groups OPEN orders into trips (one card per pool/solo),
      real haversine distance from rider base, sorted express→distance→age, estimated earn, Accept button.
- [x] Order-detail timeline shows "Finding a rider" for OPEN (VERIFIED in smoke test).

### 13.2 — Item 2: pay on delivery / cash ✅
- [x] Order form payment-method toggle (ONLINE default / CASH_ON_DELIVERY); persisted on the order.
- [x] Order detail: ONLINE → `PayButton`; CASH → "Cash on delivery" badge + "pay in cash on delivery" note.
- [x] Rider active card: `CashPaidButton` for CASH+UNPAID → `POST /api/orders/[id]/cash-paid`
      (rider-owns + cash + unpaid → PAID; no Paystack).

### 13.3 — Item 3: partial fill / custom amount ✅
- [x] Order form "How much gas?" toggle: Full / Custom with synced GHS↔kg inputs (÷×`GAS_PRICE_PER_KG`),
      clamped [1 kg, cylinder capacity] + "rider will fill exactly this amount" note.
- [x] `POST /api/orders` validates custom `requestedKg` (≥1, ≤ cylinder kg). Prediction unchanged.

### 13.4 — Item 4: terminology "Supplier" → "Rider" (copy only) ✅
- [x] Rider copy across: supplier dashboard (rebuilt), order detail ("Rider" row), `STATUS_META`,
      `notifications.ts`, `dashboard-shell` role label, and landing (how-it-works, suppliers-section, faq +
      new "Do I choose my rider?" Q, trust, roadmap, campus). Prisma model/identifiers untouched.
- [x] Admin "Suppliers" → "Riders" (stat, table heading, recent-orders column, reports labels);
      GHS/kg → "Cost/kg" (now internal cost).
- [x] `partnerStation` surfaced — **DEVIATION** from spec wording: the spec said "show on the available-
      order card," but OPEN orders have no rider yet, so it can't go there. Implemented where it's
      meaningful: the **student order detail** ("Refills at: …" once a rider is assigned — achieves the
      stated goal "students know where their cylinder is going") + the **rider dashboard header**.

### 13.5 — Item 5: rider self-application + admin approval ✅
- [x] Public `/register/rider` page + `RiderApplicationForm` → `POST /api/rider-applications` (PENDING,
      no User/Supplier). Dup email / existing account → 409 (VERIFIED 201 then 409).
- [x] Admin "Rider applications" card lists PENDING with `ApplicationActions` (approve / reject + reason).
- [x] `PATCH /api/admin/applications/[id]`: approve → `$transaction` creates User(SUPPLIER)+Supplier, sets
      APPROVED, emails login + generated temp password, **returns the temp password** so admin can relay it
      (Resend sandbox). Reject → REJECTED + emails reason.
- [x] Landing CTA "Partner with us" mailto → `/register/rider` ("Apply to ride"). `AddSupplier` kept.

### 13.6 — Seed refresh + full verification ✅
- [x] Seed: rider `lat/lng` + `partnerStation`; historical `feeGhs` = gas + solo delivery; 4 demo OPEN
      orders (a pooled pair + a cash custom-amount + an online solo, all `supplierId:null` for idempotency);
      2 PENDING applications. Idempotent re-seed verified.
- [x] `tsc --noEmit` clean; `next build` clean (24 routes); **29/29 runtime smoke checks pass** against
      `next start` (public pages, unauthed gating, all 3 role dashboards 200, application create/dup,
      atomic accept 200→409, pool claim=2 stops, student-accept 403). Test rows cleaned; re-seeded.

## Phase 13 — Review

**Shipped (teammate feedback, all verified — `tsc`+`build` clean, 29/29 runtime checks):**
- **On-demand dispatch (headline):** students no longer pick a rider. Orders broadcast as `OPEN`;
  riders see a live dispatch board (real distance, estimated earn, pooled trips as one multi-stop card)
  and claim atomically — first-to-accept wins (409 on race), pooled orders claimed as one trip.
- **Pay on delivery:** ONLINE (Paystack, unchanged) or CASH_ON_DELIVERY; rider marks cash received.
- **Custom amount:** synced GHS↔kg partial-fill input; prediction adapts automatically via `verifiedWeightKg`.
- **Terminology:** all user-facing "Supplier" → "Rider"; landing copy reflects the real pickup→station→return flow.
- **Rider applications:** public `/register/rider` → admin approve (creates login + emails temp password) / reject.

**Schema:** 2 additive migrations (`add_dispatch_open_and_extras`, `order_default_open`) applied to Neon.
`PENDING` left in the enum as a legacy no-op (avoids a destructive enum drop).

**Deviations / notes:** `partnerStation` shown on student order detail + rider header (not the available-
order card — OPEN orders have no rider). Pricing is now platform-set; `Supplier.pricePerKg` retained as
internal cost only. Express tier kept (sorts first on the board).

**Pending (unchanged from before):** prod `migrate deploy` for the 2 new migrations on the next Vercel
deploy; Paystack webhook URL; Resend still sandboxed (temp-password email only reaches the owner — temp
password is also shown in the admin approve panel as a fallback).

## Phase 14 — Notifications, role-aware login, admin self-management

Four focused additions from the user spec (2026-06-07). Items 1–3 need no schema change; item 4 adds
one additive nullable column (`User.deactivatedAt`) → **migration checkpoint before its routes/UI**.
All external sends go through `lib/services/*` wrappers (ServiceLog audit + graceful degradation); a
failed notification must never block the flow. New copy stays on-brand (warm amber, mobile-first).

### 14.1 — Rider-application notifications (items 1 + 2a) ✅
- [x] Added helpers to `lib/services/notifications.ts`: `notifyAdminsNewApplication(app)` (email + SMS to
      EVERY `role:ADMIN` — name/phone/business/vehicle/coverage/station + link to `/admin#applications`)
      and `notifyApplicantReceived(app)` (applicant email + SMS: received, reviewed within 24h). Each is
      self-wrapped (try/catch inside) so it never throws into the request. Shared email shell/CTA helpers.
- [x] `POST /api/rider-applications`: captures the created record; calls both helpers before responding.
- [x] Added `id="applications"` anchor (+ `scroll-mt-24`) to the admin Rider-applications card.

### 14.2 — Applicant lifecycle notifications (items 2b–2d) ✅
- [x] `notifyApplicationApproved({to,phone,fullName,email,tempPassword})` (email: login + temp pw +
      `/login?role=rider` link; SMS: congrats) and `notifyApplicationRejected({to,phone,fullName,reason})`
      (email + SMS). Wired into `PATCH /api/admin/applications/[id]` (replaced the two inline emails; still
      returns `tempPassword` to the admin panel).
- [x] `notifyRiderFirstOrder(orderId)`: in `POST /api/orders/[id]/accept`, after the claim, detects the
      rider's first-ever trip (`ratingCount === 0 && total orders === claimed count` — pool-safe) → email +
      SMS the rider (weigh + photograph reminder, link to `/rider`).

### 14.3 — Role-aware /login variants (item 3) ✅
- [x] `login/page.tsx`: reads `?role=` via `useSearchParams()` → student(default)/rider/admin heading +
      sub + CTAs; form wrapped in `<Suspense>`. Admin = terse, no register links. Rider = prominent
      "Apply to ride" outline button + "Student sign in" link.
- [x] `AuthSidePanel` client component (reads role, layout wraps it in `<Suspense>`); rider tagline,
      admin = plain dark panel (logo only), default = student copy/illustration.
- [x] Nav wiring: `SignOutButton` gained `callbackUrl`; `DashboardShell` passes `/login?role=admin`
      (ADMIN), `/login?role=rider` (SUPPLIER), `/` (STUDENT). Landing rider section gained "Already a
      rider? Sign in" → `/login?role=rider`.

### 14.4 — Admin can create / remove admins (item 4)
- [x] **Migration `add_admin_deactivation`** (`20260607200031`) — additive nullable `User.deactivatedAt
      DateTime?`; applied to Neon (verified: single `ADD COLUMN`, no reset). **CHECKPOINT signed off.**
- [x] `authorize()`: rejects login when `deactivatedAt` is set (VERIFIED: deactivated admin → no session).
- [x] `POST /api/admin/admins` (admin-only; zod fullName/email/password≥8; email-unique → 409) → creates
      `User(ADMIN)` + welcome email (creds + `/login?role=admin` link) via the wrapper. SMS skipped (no
      phone collected — degrades gracefully).
- [x] `DELETE /api/admin/admins/[id]` soft-deactivates (sets `deactivatedAt`); guards: admin-only, never
      the last active admin, not self, already-removed → 409.
- [x] Admin "Admin accounts" card (below Riders): lists active admins (name / email / joined), inline
      collapsible `AddAdmin` form (AddSupplier pattern), per-row Remove (disabled + `title` tooltip when
      last or self; "(you)" tag on own row).
- [x] **Verify** — `tsc --noEmit`, `next build` (27 routes), `next lint` all clean. Runtime smoke vs
      `next start`: public + `/login?role=` variants 200; rider application 201 (admin + applicant email/
      SMS audited to ServiceLog, graceful degradation); admin guards 401; authed create 201 / dup 409 /
      self-remove 400 / remove-other 200 / re-remove 409; deactivated login rejected. Test rows cleaned.

## Phase 14 — Review

**Shipped (all verified — `tsc`/`build`/`lint` clean + runtime smoke vs `next start`):**
- **Rider-application notifications:** on submit, every admin gets an email + SMS (full applicant detail +
  deep link to `/admin#applications`); the applicant gets a "received, reviewed within 24h" email + SMS.
- **Applicant lifecycle:** approve/reject now send email **and** SMS (approve carries the temp password +
  `/login?role=rider`); a rider's first-ever claim fires a welcome + verified-fill reminder (pool-safe
  detection: `ratingCount===0 && totalOrders===claimedCount`).
- **Role-aware `/login`:** `?role=rider|admin` switches heading/sub/CTAs + side panel (admin = plain dark,
  no register links). Sign-out lands riders on `?role=rider`, admins on `?role=admin`; landing gained an
  "Already a rider? Sign in" link.
- **Admin self-management:** admins create other admins (welcome email) and soft-deactivate them
  (`User.deactivatedAt`; can't log in; last-admin + self guards). New "Admin accounts" card on `/admin`.

**Schema:** 1 additive migration (`add_admin_deactivation`, nullable `User.deactivatedAt`) applied to Neon.

**Deviations from spec (small, noted with the user):** first-order detection generalised to be pool-safe;
added a "can't remove yourself" guard beyond the last-admin rule; admin email deep-links to the
`#applications` anchor (added to the card). All notifications route through `lib/services/*` (audited).

**Pending (unchanged):** prod `migrate deploy` for the new migration on the next Vercel deploy; Resend
still sandboxed (real recipient emails are rejected by the sandbox but logged — SMS via mNotify is live).
