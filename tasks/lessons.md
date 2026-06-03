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
