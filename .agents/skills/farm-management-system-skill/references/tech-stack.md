# Farm Management System: Finalized Technology Stack

**Document purpose:** Record the recommended technology stack,
architecture, implementation approach, and estimated operating costs for
the Farm Management System.

**Project context:** A small family farm initially managing oyster
mushroom production and crops such as lettuce. The system serves Owners
and Staff, with a mobile-first interface and core offline record keeping
for field work.

**Decision summary:** Use a **React + TypeScript Progressive Web App
(PWA), Supabase, and Dexie.js**. This combination prioritizes
development speed, managed backend services, and reliable offline
harvest recording without requiring a custom backend server for ordinary
application operations.

> **Cost note:** Prices below are planning estimates, not guaranteed
> quotes. Confirm current provider pricing before production deployment.
> The illustrative conversion rate used is **US\$1 ≈ ₱58**; actual PHP
> charges may vary with exchange rates, taxes, and bank fees.

------------------------------------------------------------------------

## 1. Goals and constraints

The selected architecture should support:

-   A mobile-first experience for Staff recording information in the
    field.
-   Distinct Owner and Staff views and permissions.
-   Crop, batch, harvest, task, and farm configuration records.
-   Dashboard summaries and production history/reports.
-   Core offline operation for harvest recording and essential batch
    updates.
-   Automatic synchronization attempts when connectivity returns, with
    visible sync status.
-   A managed backend to reduce infrastructure and backend
    implementation work.
-   A stack focused on web development and suitable for a small family
    farm.

### Key architectural principle

**A managed backend does not automatically provide offline
functionality.** Supabase can manage authentication, PostgreSQL, and
database access policies, but the web app must still save records
locally and implement a reliable synchronization process.

------------------------------------------------------------------------

## 2. Finalized stack

  -----------------------------------------------------------------------
  Layer                   Selected technology     Purpose
  ----------------------- ----------------------- -----------------------
  Frontend framework      React                   Build the Owner and
                                                  Staff application
                                                  interfaces.

  Language                TypeScript              Improve maintainability
                                                  and catch many errors
                                                  during development.

  Build tooling           Vite                    Fast local development
                                                  and frontend production
                                                  builds.

  Styling                 Tailwind CSS            Build responsive
                                                  layouts and consistent
                                                  styling quickly.

  UI components           shadcn/ui               Reusable forms,
                                                  dialogs, tables, cards,
                                                  and other interface
                                                  components.

  Routing                 React Router            Navigate between
                                                  dashboard and feature
                                                  screens.

  Remote/server state     TanStack Query +        Manage remote data
                          Supabase JS             fetching, loading/error
                                                  states, mutations, and
                                                  cache invalidation.

  Local offline data      Dexie.js + IndexedDB    Persist records on the
                                                  device and maintain the
                                                  pending synchronization
                                                  queue.

  PWA and asset caching   `vite-plugin-pwa` +     Cache the application
                          Workbox                 shell and assets so the
                                                  app can reopen offline.

  Authentication          Supabase Auth           Managed sign-in and
                                                  session management.

  Database                Supabase PostgreSQL     Store farm records and
                                                  relationships.

  Authorization           PostgreSQL Row Level    Enforce data access
                          Security (RLS)          rules in the database.

  Complex database        PostgreSQL functions /  Support validated,
  operations              Supabase RPC            atomic multi-step
                                                  operations when needed.

  Form validation         Zod + React Hook Form   Validate user input and
                                                  keep form structures
                                                  consistent.

  Charts                  Recharts                Display harvest and
                                                  production summaries.

  Frontend hosting        Netlify Free initially; Host the web
                          consider Netlify        application.
                          Personal or Vercel Pro  
                          if needed               

  Domain                  Custom domain, optional Give the application a
                          for early testing       stable,
                                                  easy-to-remember
                                                  address.
  -----------------------------------------------------------------------

The core libraries are generally available without a license or
subscription fee. Hosting, managed database resources, and usage beyond
free-tier allowances may cost money.

------------------------------------------------------------------------

## 3. Recommended architecture

``` text
Owner and Staff devices
          |
          v
React + TypeScript PWA
(Vite, React Router, Tailwind, shadcn/ui)
          |
          +------------------------------+
          |                              |
          v                              v
Dexie.js / IndexedDB               Supabase JS client
Local records and queue                  |
Offline sync state                       v
                                  Supabase Auth
                                  PostgreSQL + RLS
                                          |
                                          v
                                Database functions / RPC
                                for selected complex operations
```

### Responsibilities

**Frontend PWA** - Provides the mobile-first interface and role-specific
screens. - Validates forms before saving. - Displays whether records are
pending, synced, or need attention. - Initiates synchronization when
appropriate.

**Dexie.js / IndexedDB** - Saves offline records immediately. - Retains
records across page reloads and temporary connection loss. - Stores
stable record IDs and synchronization metadata. - Holds a local queue of
records awaiting upload.

**Supabase** - Manages authentication and sessions. - Stores the
authoritative farm records in PostgreSQL. - Enforces authorization
through RLS policies. - Provides database functions for operations that
need server-side validation or atomicity.

**Hosting** - Serves the PWA files. - Does not replace the local
database or synchronization logic.

------------------------------------------------------------------------

## 4. Why this stack fits the project

### Development speed

Supabase avoids the need to build and operate a separate Node.js/Express
API for ordinary CRUD operations. That leaves more time for the
farm-specific screens, validation, reporting, and offline experience.

### Web-development focus

React, TypeScript, Vite, and the supporting libraries provide a direct
web development workflow. A PWA can be installable on supported devices
without requiring a separate native mobile app.

### Relational data

PostgreSQL suits the relationships between crops, batches, and harvests,
along with tasks, users, and farm settings.

### Small family-farm scope

A managed database and authentication service reduce infrastructure
responsibilities. The initial release can stay focused on a single
family farm rather than introducing multi-tenant SaaS complexity.

### Important trade-off

Supabase reduces backend infrastructure work, but it does **not**
eliminate the need to design, implement, and test offline persistence,
synchronization, authorization, and conflict handling.

------------------------------------------------------------------------

## 5. Core offline workflow

The first release should support offline **harvest recording and
essential batch updates**. Making every screen and workflow fully
offline-capable is not necessary for the initial scope.

### Harvest synchronization flow

1.  **Open the app:** The cached PWA shell loads. The app should make
    the locally available information needed for recording accessible.
2.  **Record a harvest:** Save the harvest to IndexedDB immediately,
    even without internet. Generate a stable unique ID on the device and
    mark the record as pending sync.
3.  **Queue the record:** Keep the record in a local queue until the
    server confirms successful processing.
4.  **Attempt synchronization:** When online, submit pending records.
    Also retry when the app opens, connectivity returns, or the user
    taps **Sync now**.
5.  **Validate on the backend:** Supabase database policies and
    server-side logic verify permissions and validate the submitted
    data.
6.  **Prevent duplicate submissions:** Use the stable record ID and an
    idempotent insert/upsert strategy so retries do not create another
    copy of the same harvest.
7.  **Confirm status:** Mark the local record as synced only after the
    server confirms success. Keep failed records visible with an
    actionable error.

Do not rely exclusively on browser Background Sync because support
varies across browsers. The app should have foreground and manual retry
paths as well.

### Suggested synchronization states

-   `Pending sync`: Saved locally and waiting to upload.
-   `Syncing`: An upload attempt is in progress.
-   `Synced`: Server confirmation received.
-   `Needs attention`: The server rejected the record or a conflict
    requires action.

These may be represented as local metadata rather than columns in the
authoritative harvest table.

### Duplicate and conflict handling

-   **Two separate harvests:** Preserve both records, even if their
    quantities or timestamps are similar.
-   **The same harvest uploaded twice:** Deduplicate using its stable
    record ID.
-   **Two staff members update the same batch:** Use a version number or
    equivalent stale-update detection and define a conflict policy. Ask
    for resolution when automatic merging could lose information.
-   **Network interruption:** Retain the local record and retry safely.
-   **Validation failure:** Do not silently discard the record. Explain
    the issue and provide a way to correct or resubmit it.

### Offline limitations to handle

-   A service worker caches application resources; IndexedDB stores the
    user's actual offline records. They solve different problems.
-   Data needed for offline screens must be deliberately cached before
    the device loses connectivity.
-   Authentication sessions can expire. Define what the app allows a
    previously authenticated user to do offline and how queued data is
    handled when reauthentication is needed.
-   Local browser storage is not a substitute for server backups. Device
    loss, browser data clearing, or storage eviction can put unsynced
    records at risk. Make sync status clear and test the chosen
    browsers/devices.
-   A successful local save is not the same as a successful server sync.

------------------------------------------------------------------------

## 6. Suggested data model

Use PostgreSQL as the authoritative source of truth.

``` text
Farm
  |
  +-- Farm members / profiles
  |
  +-- Crop
        |
        +-- Batch
              |
              +-- Harvest

Farm
  +-- Tasks
  +-- Notifications
  +-- Farm settings
```

Suggested core tables:

  -----------------------------------------------------------------------
  Table                               Purpose
  ----------------------------------- -----------------------------------
  `farms`                             Farm identity and configuration.

  `profiles` or `farm_members`        Links authenticated users to a farm
                                      and their role.

  `crops`                             Crop types, such as oyster
                                      mushrooms and lettuce.

  `batches`                           Production batches and their
                                      status.

  `harvests`                          Harvest date, quantity, batch,
                                      staff member, and unique record ID.

  `tasks`                             Assignments, due dates, status, and
                                      completion details.

  `notifications`                     In-app notification records.

  `farm_settings`                     Farm-specific configuration.
  -----------------------------------------------------------------------

These are proposed entities based on the feature requirements, not a
schema already defined by the source documents. Refine field names,
required fields, and relationships during implementation.

### Data and security rules

1.  Generate UUIDs on the client for records that may be created
    offline.
2.  Enforce farm membership and role access through RLS, not just hidden
    or disabled UI controls.
3.  Never bundle a Supabase service-role key in frontend code. Use only
    the appropriate public client key with correctly configured RLS.
4.  Keep local synchronization metadata separate from business data
    where practical.
5.  Version the IndexedDB schema and migrate it safely during
    application updates, preserving pending records.
6.  Test that Staff cannot modify roles or access data outside their
    authorized farm.

------------------------------------------------------------------------

## 7. Implementation phases

### Phase 1: Foundation

-   Set up React, TypeScript, Vite, routing, styling, and reusable UI
    components.
-   Configure Supabase Auth and environment variables.
-   Define the initial PostgreSQL schema and RLS policies.
-   Implement farm membership and Owner/Staff access rules.

### Phase 2: Core MVP

-   Build the Staff harvest-recording flow.
-   Build task viewing and completion.
-   Implement essential batch updates.
-   Build the Owner dashboard and core farm management screens.
-   Test the workflows on real phone-sized screens.

### Phase 3: Offline support

-   Add the PWA app shell and asset caching.
-   Add Dexie.js and IndexedDB persistence.
-   Implement the pending-record queue and synchronization states.
-   Add retries, idempotent writes, error handling, and batch conflict
    detection.
-   Test airplane mode, reloads, failed requests, expired sessions, and
    multiple devices.

### Phase 4: Reports and expansion

-   Add production history and harvest charts.
-   Complete notifications, crop-management refinements, user
    management, and remaining features.
-   Expand offline support only for additional workflows that have a
    demonstrated need.
-   Review performance and provider usage against real operating
    patterns.

**Acceptance test for offline harvest recording:** Staff must be able to
create a harvest without connectivity, reload or reopen the app without
losing the queued record, regain connectivity, synchronize the record,
and retry without creating a duplicate server record.

------------------------------------------------------------------------

## 8. Estimated software and hosting costs

### Cost assumptions

-   Illustrative conversion rate: **US\$1 ≈ ₱58**.
-   Costs are approximate planning figures and must be rechecked against
    current provider pricing.
-   Actual PHP charges may vary due to currency exchange, taxes, card
    fees, and provider billing terms.
-   Estimates exclude development labor, internet service, and staff
    devices.

### Estimated cost by technology

  ----------------------------------------------------------------------------
  Technology / service                 Possible cost Notes
  --------------------- ---------------------------- -------------------------
  React + TypeScript +                            ₱0 Open-source tools.
  Vite                                               

  Tailwind CSS +                                  ₱0 Core tools and components
  shadcn/ui                                          are free.

  React Router                                    ₱0 Open-source.

  TanStack Query                                  ₱0 Core library is free.

  Dexie.js + IndexedDB                            ₱0 No separate storage
                                                     service fee.

  Workbox + PWA tooling                           ₱0 Core tooling is free.

  Zod + React Hook Form                           ₱0 Core libraries are free.

  Recharts                                        ₱0 Core library is free.

  Supabase Free                             ₱0/month Useful for development
                                                     and testing; free-tier
                                                     limitations apply, and
                                                     inactive projects may
                                                     pause.

  Supabase Pro                    About ₱1,450/month Based on US\$25/month;
                                                     larger quotas and daily
                                                     backups retained for
                                                     seven days.

  Netlify Free                              ₱0/month Subject to plan usage
                                                     credits and limits;
                                                     production usage can
                                                     exhaust the allowance.

  Netlify Personal                  About ₱522/month Based on US\$9/month.

  Netlify Pro                     About ₱1,160/month Based on a starting price
                                                     of US\$20/month.

  Vercel Pro                      About ₱1,160/month Based on US\$20/month;
  alternative                                        intended for
                                                     professional/commercial
                                                     workflows rather than
                                                     relying on Hobby for
                                                     commercial use.

  Custom domain             Budget ₱700--₱1,500/year Illustrative allowance
                                                     for a common domain such
                                                     as `.com`; registrar and
                                                     renewal prices vary.
  ----------------------------------------------------------------------------

Provider prices and plan limits can change. Verify the current Supabase,
Netlify, and Vercel pricing pages before committing to a plan.

### Example monthly scenarios

  ------------------------------------------------------------------------
  Scenario              Configuration         Estimated monthly equivalent
  --------------------- --------------------- ----------------------------
  A. Development and    Supabase Free +       ₱0/month, excluding optional
  testing               Netlify Free +                              domain
                        open-source tools     

  B. Low-cost           Supabase Pro +          About ₱1,500--₱1,600/month
  production            Netlify Free + domain 
                        allowance             

  C. More hosting       Supabase Pro +          About ₱2,000--₱2,100/month
  headroom              Netlify Personal +    
                        domain allowance      

  D. Vercel production  Supabase Pro + Vercel   About ₱2,700--₱2,800/month
  hosting               Pro + domain          
                        allowance             
  ------------------------------------------------------------------------

These are scenario estimates, not guaranteed invoices. Free hosting
plans have usage limits; if those limits are exhausted, the app may
require an upgrade or usage adjustment. Supabase costs may also rise if
additional compute resources, projects, or usage are required. Review
the current billing terms before production use.

### Cost recommendation

**During development:** Start with Supabase Free and Netlify Free.
Validate the screens and offline workflow with actual staff devices
before paying for higher-tier services.

**When the farm relies on the system for daily operations:** Budget
roughly **₱1,500--₱2,100 per month** for Supabase Pro with Netlify Free
or Personal, plus the annual domain allowance. Reassess the hosting plan
based on measured usage and the consequences of hitting a limit.

Prioritize reliable database persistence, access controls, and backups
over premium frontend hosting features. A paid subscription does not by
itself guarantee offline synchronization reliability; that depends on
the application implementation and testing.

------------------------------------------------------------------------

## 9. Trade-offs and future considerations

### Advantages

-   Fast to start without building a separate API server.
-   Strong fit for relational farm records.
-   Web-first TypeScript development workflow.
-   Managed authentication and database infrastructure.
-   Can be installed as a PWA on supported devices.
-   Local storage supports essential field recording during connectivity
    loss.

### Trade-offs

-   Offline synchronization and conflict handling still require custom
    development.
-   RLS policies must be designed and tested carefully.
-   Free-tier services are suitable for development but may not be
    appropriate for dependable daily operations.
-   Browser storage can be cleared or evicted; pending offline records
    need careful handling.
-   A PWA does not guarantee identical behavior across every browser or
    mobile device.

### If the product expands

If the system grows to several farms under one organization or becomes a
multi-tenant SaaS product, revisit farm-level data isolation, membership
and role models, administration, billing, and operational monitoring.
The proposed stack can support growth, but those requirements should be
designed explicitly rather than assumed.

------------------------------------------------------------------------

## 10. Final decision

**Adopt React + TypeScript + Vite + Tailwind CSS + shadcn/ui +
Supabase + Dexie.js + PWA tooling.**

Use Supabase Auth and PostgreSQL with RLS as the managed backend. Use
Dexie.js and IndexedDB for local persistence and an explicit
synchronization queue. Start with the core offline workflows of harvest
recording and essential batch updates, and expand only after those
workflows have been tested with real staff devices.

This stack is the best fit for the current priorities:

-   **Development priority:** Speed.
-   **Offline requirement:** Core offline record keeping.
-   **Backend preference:** Managed services.
-   **Expected scale:** One family farm.
-   **Development focus:** Web application development.

The most important validation step is to prove that staff can record
offline, reopen the app without losing queued data, sync when
connectivity returns, and retry without creating duplicates.
