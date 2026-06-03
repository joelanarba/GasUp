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
