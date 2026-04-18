# GreenStake

Interview-ready MVP for a subscription-led golf + charity + draw platform.

## What This Build Includes

- Multi-gateway payment architecture with fallback:
  - Primary: Razorpay payment links
  - Last-resort: Mock provider for demo continuity
- Supabase-backed auth + data model:
  - Auth (signup/login/session)
  - Profile + role model (`subscriber`, `admin`)
  - Subscriptions
  - Score entries (Stableford)
  - Draws, entries, and winners tables
- RLS policies and role-aware access boundaries
- Dashboard APIs and admin APIs:
  - `/api/me`
  - `/api/scores`, `/api/scores/[scoreId]`
  - `/api/admin/stats`
  - `/api/draws/simulate`
- Draw simulation engine:
  - `random` mode
  - `weighted` mode based on score frequencies
  - tiered pool split and jackpot rollover logic

## Architecture Highlights

- Domain-first modules (`lib/domain`, `lib/repositories`, `lib/draws`, `lib/payments`)
- Swappable payment provider interface (`PaymentProvider`)
- Middleware and API-level authorization checks
- Separation of concerns:
  - UI components
  - API route handlers
  - Repository/data access
  - Business logic services

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy env template and fill values:
```bash
cp .env.example .env.local
```

Required for production mode:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

3. Apply SQL migration in Supabase SQL editor:
- `supabase/migrations/0001_init.sql`

4. Run app:
```bash
npm run dev
```

## PRD Logic Covered

- Score rules:
  - Range `1..45`
  - One score per date (unique constraint)
  - Latest 5 retained (trigger)
  - Reverse chronology in API/UI
- Subscription lifecycle base:
  - Pending at checkout creation
  - Activation via Razorpay webhook
  - Mock provider auto-activation for demos
- Draw simulation:
  - monthly-ready engine with jackpot rollover semantics

## What to Build Next

- Full draw publish pipeline (persist winners + payouts after simulation)
- Winner proof upload + moderation UI
- Email notifications for draw results and verification
- Webhook support for Razorpay subscription activation path
- Automated tests (repository + API integration + draw engine)

## Interview Talking Points

- Why payment providers were abstracted from business flows
- How RLS enforces tenant security by default
- Why score retention is implemented in DB trigger (source-of-truth)
- How draw engine is isolated to support future workers/queues
- How this structure supports mobile app/API expansion without refactor
