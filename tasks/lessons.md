# Lessons

Append a new entry after any correction. Format: **Pattern** → the rule that prevents it.

## Pre-seeded (decided during planning — do not relitigate)

- **Don't suggest Firebase.** Postgres was chosen deliberately because prediction +
  pooling are relational/aggregate queries. → Keep Postgres + Prisma.
- **Don't build a desktop-only app.** Brief says "desktop" but users are mobile-first and
  GPS tracking needs phones. → Build a mobile-first responsive web app.
- **Don't let it become a generic delivery clone.** Every feature should reinforce
  prediction, trust, or pooling. → Defer anything that doesn't.
- **Don't call external SDKs directly from routes/components.** → Always go through
  `lib/services/*` wrappers with ServiceLog audit + graceful degradation.
- **Don't add supplier self-signup.** → Suppliers are admin-created (per SRS).
- **Don't generate generic AI UI** (Inter font, purple-on-white gradients). → Commit to
  the warm amber/flame campus aesthetic via CSS vars.

## Discovered during build

- **Don't run `next build` while `next dev` is running** (they share `.next`; the dev
  server ends up with mismatched vendor chunks → `Cannot find module './vendor-chunks/jose.js'`
  → every authed page 500s). → Stop dev first, or `rm -rf .next` and restart dev after a build.
- **`pkill -f next` (git-bash) does NOT reliably kill Windows node processes.** Zombie dev
  servers pile up on ports 3000→3006, all writing the same `.next` and corrupting it. → Kill
  via PowerShell by port (`Get-NetTCPConnection -LocalPort ... | Stop-Process`) and confirm
  no listeners remain before restarting.
- **Neon free tier has a low connection cap.** Spawning many one-off `PrismaClient` scripts
  that error before `$disconnect()` exhausts it ("Can't reach database server"). → Verify via
  the running app's pages, not throwaway standalone Prisma processes.
- **react-leaflet@5 needs React 19**; on Next 14 / React 18 pin `react-leaflet@4`.
- **`DELIVERED` is not "in flight."** When suppressing proactive refill alerts for students who
  already have gas coming, only count not-yet-delivered statuses (PENDING/ACCEPTED/VERIFYING/
  ON_THE_WAY). `DELIVERED` is a completed refill (the very history prediction reads from); a fresh
  one already reads "full" so won't trigger, and a stale un-confirmed one *should* still nudge.
  → Don't lump terminal/near-terminal lifecycle states into an "active" filter without checking
  what each state actually means for the feature.
- **A schema refactor MUST get a migration.** The hostel/room → free-form address+lat/lng refactor
  changed `schema.prisma` and the code, but no migration was ever generated. The Neon DB is still on
  `init`+`add_express` (old `Hostel`/`hostelId`/`roomNumber` model), so a *fresh* Prisma client throws
  `P2022: column User.defaultAddress does not exist`. A long-running `next dev` masks this because the
  global PrismaClient singleton keeps a stale in-memory client. → After ANY `schema.prisma` edit run
  `prisma migrate dev` and verify against the **deploy** DB; never trust a running dev server to prove
  the DB matches the schema. Confirm with a throwaway `prisma generate` + a fresh query.
- **Don't trust a Windows git-status snapshot.** With `core.autocrlf=true` and no `.gitattributes`,
  `git status` lists files as modified purely from CRLF stat-noise (zero real diff). Run `git diff HEAD`
  to see actual content changes; `git status` reports clean again once a diff refreshes the stat cache.
  → Verify "uncommitted work" with `git diff HEAD --stat`, not the status list alone.
- **UCC's on-campus halls (Atlantic, Adehye, Oguaa, Casford, Valco…) are the WRONG market — they don't
  cook with LPG.** The gas-delivery customers are students in the **private hostels** in the surrounding
  communities: Amamoma, Apewosika, Kwaprow, Science (New Site), Kokoado. Real hostel names to use in
  demo data/copy: Hamglor, Ewusiwa, Topp, St. Paul, NEST, Baduwa, Golden Royal Palace (Kwaprow), Juliborn.
  → Seed addresses + landing copy must use private hostels in those communities, never the official halls;
  and these are "hostels," not "blocks" (halls have blocks, private hostels are buildings).
- **Adding an enum value and using it as a default must be two separate migrations.** Postgres throws
  "unsafe use of new value of enum type" if you `ALTER TYPE ... ADD VALUE 'X'` and then reference `'X'`
  (e.g. `SET DEFAULT 'X'`) in the same transaction/migration. → Migration 1 adds the value; migration 2
  (separate, after the first is committed) uses it. Splitting `OrderStatus += OPEN` from the
  `Order.status default → OPEN` flip is exactly why both applied cleanly.
- **Prisma `ALTER TYPE ADD VALUE` appends to the END of the PG enum**, ignoring where you place the value
  in `schema.prisma` (no `BEFORE`/`AFTER` emitted). The DB enum's internal sort order then differs from the
  schema file. → Never rely on a Postgres enum's intrinsic order for lifecycle/sorting; drive order from a
  code array (we use `ORDER_TIMELINE`). The mismatch is cosmetic and safe as long as nothing `ORDER BY`s it.
- **Spreading a Map iterator (`[...map.entries()]` / `[...map.values()]`) fails `tsc`** under this project's
  target (`TS2802` — needs `--downlevelIteration` or `target ≥ es2015`). → Use `Array.from(map.entries())`,
  which type-checks without flag changes and preserves inference (spreading also silently degraded the
  `.map` callback params to `any`).
- **Object literals inside an array widen string literals to `string`.** A seed array with
  `paymentMethod: "ONLINE"` infers `string`, which is NOT assignable to the Prisma enum input. → Use the
  generated enum members (`PaymentMethod.ONLINE`, `ApplicationStatus.PENDING`) in seed/data arrays, or each
  element gets a contextually-typed annotation.
- **Idempotent seed rows that app flows mutate must explicitly RESET the mutated fields in the upsert
  `update`.** The demo OPEN orders are claimed (supplierId set, status→ACCEPTED) by an accept test; the
  upsert `update` must set `supplierId: null` + `status: OPEN` (not just omit them) or a re-seed leaves a
  half-claimed "OPEN" order with a rider attached. → Upsert `update` = the full desired clean state, not a
  diff.
- **Throwaway Node ESM scripts run from outside the repo can't resolve `@prisma/client`** (`ERR_MODULE_NOT_FOUND`).
  → Put one-off scripts in the project root so Node resolves `node_modules`, or verify via `fetch` against the
  running server (no Prisma import needed). The fetch-based verifier was connection-free; only the row-cleanup
  needed Prisma and had to live in-repo.
- **Atomic claim under broadcast dispatch = guarded `updateMany` + check `count`.** To make "first rider to
  accept wins," do `updateMany({ where: { id, status: "OPEN" }, data: { supplierId, status: "ACCEPTED" } })`
  inside a `$transaction` and treat `count === 0` as "already taken" (409). Under READ COMMITTED the loser's
  WHERE re-evaluates after the winner commits → 0 rows. A plain `findUnique`-then-`update` would let both win.
- **A Next.js `layout` can't read `searchParams` — only `page` components can.** To make the auth
  left-panel vary by `?role=`, the param had to be read in a *client* component (`AuthSidePanel`) via
  `useSearchParams()`, which the layout wraps in `<Suspense>`. → When shared chrome (layout) must react to
  a query param, push the param-reading into a client child + Suspense; don't try to thread it through the
  layout. And any `useSearchParams()` usage needs a `<Suspense>` boundary or `next build` fails with
  "useSearchParams() should be wrapped in a suspense boundary" (and the page silently deopts to dynamic).
  Wrapping kept `/login` statically prerendered (○) with the variant hydrating client-side.
- **The "last admin" 409 guard is real but practically unreachable via the UI — keep it as defense in
  depth.** Since the actor is always an *active* admin, any *other* admin target means ≥2 active admins, so
  the last-admin count check never trips for a non-self target; the self-removal 400 guard is what actually
  prevents lockout. → Don't assume an untested guard is dead code; it covers races / future callers. Smoke
  the reachable paths (create 201, dup 409, self-remove 400, remove-other 200, re-remove 409) and the login
  rejection for the deactivated account, rather than contriving the unreachable one.
- **Resend sandbox rejects every recipient except the account owner** ("You can only send testing emails to
  your own email address"), logged as `resend/send ok=false`. This is NOT a bug — it's the wrapper degrading
  gracefully. mNotify SMS, by contrast, is genuinely live (`ok=true`). → When smoking notifications, read
  ServiceLog: a sandbox-rejected email still proves the call fired and was audited; assert on the log row,
  not on inbox delivery.
- **Verify auth-gated routes via the real NextAuth credentials flow over HTTP, not a faked cookie.** Get
  `/api/auth/csrf` with `-SessionVariable`, POST form-urlencoded `{csrfToken,email,password,json:true}` to
  `/api/auth/callback/credentials`, then reuse the `-WebSession`; confirm with `/api/auth/session`. This is
  the connection-light, lessons-approved way to smoke admin-only routes against `next start`.
- **Windows PowerShell 5.1 `Set-Content -Encoding utf8` writes a UTF-8 BOM**, and Postgres rejects a BOM
  at the start of a migration: `migrate deploy` failed with `P3018` / `42601 syntax error at or near "﻿"`
  (U+FEFF). Because the BOM fails parsing at position 0, NO DDL runs (schema untouched), but a *failed*
  row is recorded in `_prisma_migrations`, blocking further deploys. → Never author files other tools
  read (SQL, JSON, .sql migrations) with PS5.1 `Set-Content/Out-File -Encoding utf8`; use the Write tool
  (no BOM) or `[IO.File]::WriteAllText(path,text)` / PS7 `utf8NoBOM`. Recover a BOM-poisoned migration:
  fix the file, `prisma migrate resolve --rolled-back <name>`, then `prisma migrate deploy` again. When
  hand-creating a migration non-interactively, prefer `migrate diff … --script` piped to the Write tool.

- **"Use my location" must reverse-geocode, not just drop a pin.** The GPS button only set the map
  pin's lat/lng; it never filled the "Delivery address" text, which the order form requires (`!address.trim()`
  blocks submit). So GPS "did nothing" and students were forced to type. → When coordinates feed a form
  that also needs a human-readable address, reverse-geocode them (server route → Nominatim, graceful
  fallback) to auto-fill the field. Also always *render* the geolocation denied/unsupported/error states —
  a silent failure reads to the user as "broken."
