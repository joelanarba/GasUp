# START HERE — GasUp bootstrap

This folder is a **bootstrap kit**, not the app yet. Claude Code builds the app from it.

## 1. One-time setup before you open Claude Code

Get free accounts + keys, then fill `.env`:
- **Neon** (neon.tech) → Postgres connection string → `DATABASE_URL`
- **Resend** (resend.com) → API key → `RESEND_API_KEY`
- **Paystack** (dashboard.paystack.com) → **TEST** keys → `PAYSTACK_*`
- **mNotify** (mnotify.com) → fund account, get API key + approved Sender ID → `MNOTIFY_*`
- `cp .env.example .env` and paste them in. Generate `NEXTAUTH_SECRET` with
  `openssl rand -base64 32`.

> Tip: you can get the app fully working with Neon + Resend + Paystack first, and add the
> mNotify key last — the SMS wrapper degrades gracefully if the key is missing.

## 2. Open Claude Code in this folder

```bash
cd gasup-kit
claude
```

Claude Code will read `CLAUDE.md` automatically. Then paste the kickoff prompt below.

## 3. Kickoff prompt (paste this verbatim)

---

Read CLAUDE.md, tasks/todo.md, and tasks/lessons.md in full before doing anything.

You're building GasUp from this bootstrap kit. `prisma/schema.prisma` and `.env.example`
already exist — use them as-is; ask me before changing the schema.

Work the phases in tasks/todo.md in order. Plan each phase as checkable items, update the
file as you go, and capture any correction I give you in tasks/lessons.md.

Start with Phase 0 (scaffold) through Phase 2 (auth + the three role dashboards, routed but
mostly empty). Then STOP at the checkpoint, run the dev server, prove I can log in as
student/supplier/admin and land on the right dashboard, and wait for my sign-off before you
build the differentiators.

Constraints I care about most:
- Mobile-first, distinctive UI — no generic AI look, warm amber/flame gas aesthetic.
- All external service calls go through lib/services/* wrappers with graceful degradation
  and ServiceLog audit — a dead API must never crash the order flow.
- Keep changes simple and root-cause; don't over-engineer; prove things work before
  marking them done.

Confirm your understanding and show me your Phase 0–2 plan before writing code.

---

## 4. After the checkpoint

Once routing works, tell Claude Code to proceed phase by phase. The differentiators
(prediction, verified-fill, pooling) are Phases 4–6 — these are what earns the grade, so
don't rush them.

## 5. The business deliverable

The project is graded equally on business viability. When the app is functional, ask me
(Claude, in the chat) to generate the **pitch deck** — reframed Business Model Canvas + the
corrected pooled unit economics that show lower student price AND higher rider earnings.
That's the "what makes it different and how it profits" answer your lecturer wants.

## Files in this kit
- `CLAUDE.md` — persistent context + guardrails (Claude Code reads every session)
- `tasks/todo.md` — phased build checklist
- `tasks/lessons.md` — pre-seeded mistakes-not-to-repeat
- `prisma/schema.prisma` — the data model (powers prediction + pooling)
- `.env.example` — all required keys with where-to-get notes
