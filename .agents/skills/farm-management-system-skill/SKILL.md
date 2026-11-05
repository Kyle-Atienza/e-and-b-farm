---
name: farm-management-system
description: Build and maintain the Farm Management System using its approved React, TypeScript, Supabase, and offline-first PWA architecture. Use when implementing features, changing data models, building UI, working with authentication or authorization, or modifying offline persistence and synchronization.
---

# Farm Management System Development Skill

## Purpose
Follow the approved architecture and project requirements when implementing this system. Do not change core architectural decisions without explaining the reason and obtaining approval.

The system is initially for one family farm. It has Owner and Staff workflows, a mobile-first web interface, and core offline record keeping.

## Read project references first
Consult the relevant references before changing a feature:
- `references/tech-stack.md`: approved stack, architecture, offline approach, implementation phases, and cost assumptions.
- `references/user-personas.md`: user needs and usage context.
- `references/feature-list.md`: functional requirements.
- `references/project-brief.md`: project goals and context.
- `references/screen-specifications.md`: screen requirements and UI behavior.

If a reference is missing, look for the corresponding project source. Do not invent requirements. Identify conflicts or gaps and ask for clarification when they affect implementation.

## Approved stack
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query + Supabase JS
- Supabase Auth + PostgreSQL + Row Level Security (RLS)
- Dexie.js + IndexedDB
- `vite-plugin-pwa` + Workbox
- Zod + React Hook Form
- Recharts
- Supabase database functions/RPC for selected validated or atomic operations

Do not introduce a separate Node.js/Express backend for ordinary CRUD operations unless a concrete requirement justifies it.

## Architecture principles
1. Build responsive, mobile-first interfaces, especially for Staff workflows.
2. Use Supabase as the managed authentication and database backend.
3. Supabase does not provide offline behavior automatically. Implement local persistence and synchronization in the app.
4. PostgreSQL is the authoritative source of truth. Local records remain pending until server confirmation.
5. Enforce authorization through RLS. Hiding UI controls is not security.
6. Initially support offline harvest recording and essential batch updates. Do not expand offline scope without a requirement.
7. Prefer the approved stack and avoid unnecessary services or dependencies.

## Suggested source structure
Follow existing repository conventions first. If no structure exists, use a feature-oriented layout:

```text
src/
├── app/                 # router, providers, layouts
├── components/ui/       # shared UI primitives
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── crops/
│   ├── batches/
│   ├── harvests/
│   ├── tasks/
│   ├── reports/
│   ├── notifications/
│   └── users/
├── lib/
│   ├── supabase/
│   ├── offline/
│   └── validation/
├── hooks/
├── types/
└── styles/

supabase/
├── migrations/
├── functions/
└── seed.sql

tests/
├── unit/
├── integration/
└── e2e/
```

Do not reorganize an existing repository just to match this example. Make incremental changes.

## Data and database rules
- Model production around Crop → Batch → Harvest.
- Keep farm membership and user roles explicit.
- Generate UUIDs on the client for records that may be created offline.
- Treat PostgreSQL as the source of truth.
- Use migrations for schema changes.
- Apply RLS to tables exposed to the client.
- Restrict users to records belonging to their authorized farm and role.
- Never expose a Supabase service-role key in browser code.
- Keep local sync metadata separate from business fields where practical.
- Use database constraints and idempotent writes to protect data integrity.
- Do not assume permissions that are not defined in the project requirements.

## Offline persistence and synchronization
Initial offline scope:
- Harvest recording.
- Essential batch updates.

For an offline-created record:
1. Validate locally.
2. Generate a stable UUID.
3. Save immediately to IndexedDB.
4. Add it to the local synchronization queue.
5. Show a pending status.
6. Attempt sync on app startup, reconnection, and user-requested retry.
7. Reuse the same ID for every retry.
8. Mark synced only after server confirmation.
9. Retain failures and show actionable errors; never silently discard records.

Suggested local sync states: `pending`, `syncing`, `synced`, `needs_attention`. These are local metadata and do not automatically belong in the authoritative business tables.

### Duplicate prevention and conflicts
- Use the stable client-generated ID as an idempotency key and enforce uniqueness server-side.
- Retrying one record must not create a duplicate harvest.
- Two distinct harvests must remain distinct even if quantities or timestamps are similar.
- Treat harvests as separate append-only records unless requirements say otherwise.
- Detect stale updates when multiple staff members edit the same batch. Use a version or equivalent concurrency check.
- Do not silently overwrite changes if that could lose data.

### Offline reliability
- Service-worker caching of assets and IndexedDB persistence of business records are separate concerns.
- Explicitly cache the data needed for offline workflows.
- Do not rely only on browser Background Sync; also retry on app startup, reconnect, and manual action.
- Define behavior for expired authentication sessions and queued records requiring reauthentication.
- Preserve queued records during IndexedDB schema upgrades.
- Clearly distinguish a local save from a server-confirmed sync.

## UI and experience rules
- Prioritize fast, understandable Staff workflows on mobile.
- Align Owner and Staff experiences with their defined responsibilities and permissions.
- Show saving, pending, syncing, synced, and error states where relevant.
- Minimize navigation required for harvest recording and task completion.
- Include accessible labels, validation, loading, empty, and error states.
- Follow supplied screen specifications; identify proposed additions as proposals.

## Security rules
- Use Supabase Auth for identity and sessions.
- Enforce authorization in RLS policies.
- Treat frontend role checks as presentation logic, not a security boundary.
- Never expose service-role secrets in client code.
- Validate sensitive operations on the server/database side.
- Test both permitted and denied access for Owner and Staff roles.

## Development workflow
Before coding:
1. Identify the requested feature and its source requirements.
2. Inspect the existing repository and reuse its conventions.
3. Identify affected screens, data entities, permissions, and offline behavior.
4. State assumptions and unresolved requirements.
5. Choose the smallest implementation that satisfies the requirement.

While coding:
- Keep changes focused and typed.
- Reuse existing components and dependencies.
- Add validation and migrations where needed.
- Consider loading, error, empty, and offline states.
- Preserve pending offline data when changing local storage.

After coding:
- Run available type checks, linting, and relevant tests.
- Test RLS and role-specific access for affected operations.
- For offline changes, test disconnect → create/update → reload → reconnect → sync → retry.
- Verify retries do not create duplicates.
- Summarize changed files, behavior, tests, and remaining risks.

## Cost and service selection
- Use free tiers during development where appropriate.
- Consider Supabase Pro when daily operations require production-level allowances and backups.
- Start with Netlify Free; upgrade hosting only when usage or operational needs justify it.
- Treat prices in `references/tech-stack.md` as estimates and verify current provider pricing.
- Explain the benefit and recurring cost before adding paid services.

## Architectural changes
Propose changes only when requirements cannot reasonably be met, a demonstrated reliability/security/performance issue exists, project scope changes materially, or the owner requests a comparison. Explain rationale, migration impact, trade-offs, and recurring costs. Obtain approval before replacing a core technology.
