# AuraRank — Production Readiness

Status of every PRD / pre-launch item, plus the manual steps required to deploy.

## ✅ Implemented & verified (build + lint + 18 unit tests green)

### Scoring honesty (PRD Part 3)
- Fake/non-existent brands score **0–10** — verified by unit tests (`src/lib/analyzer.test.ts`).
- Sentiment contributes **0** when the brand is not genuinely mentioned.
- "Unfamiliar brand" responses ("I'm not familiar with X") are **not** counted as mentions.
- Brand-echo prompts ("what is X", "X review") are **excluded** from the visibility score.
- Score formula: 50% mention frequency + 30% position + 20% sentiment; capped at 15 with zero mentions.
- Score labels: Invisible / Very Low / Low / Moderate / Strong / Dominant.

### Dashboard & insight features
- Chart placeholder states (never blank): trend chart prompts for a 2nd scan; competitor chart shows upgrade CTA on Starter.
- Industry benchmark bar (you vs industry avg vs top 10%).
- One-Click AI Visibility Boost (FAQ, brand bio, JSON-LD, 10 facts) — Max plan, via `/api/boost`.
- AI Response Viewer — actual GPT response under each missed-search opportunity.
- Authentic-score warning when score > 40 with < 2 genuine mentions.
- First-time results walkthrough (dismissible, localStorage).

### Retention features (PRD Priority 2)
- **Scheduled auto-scans + weekly digest** — `/api/cron` (Vercel Cron daily), per-brand `auto_scan` (Pro = weekly, Max = daily), digest email with score delta, new opportunities, competitor movement, 3 quick actions. Toggle in **Settings → Scheduled Auto-Scans**.
- **Competitor alerts** — surfaced on the dashboard and in the digest when a competitor gains ≥2 AI mentions vs the previous scan.
- **Progress-linked recommendations** — completion state persists across scan regenerations.

### Platform / security
- Server-side plan enforcement on all write routes (brand limit, scan quota, boost = Max, auto-scan plan gating); 401/403 as specified.
- Supabase RLS on every table; scans now carry `user_id` for correct per-user quota (see migration below).
- Polar.sh checkout → webhook → customer-portal flow complete; checkout carries `external_customer_id` + `metadata.user_id` so webhooks and the portal resolve the user for upgrade/downgrade/cancel.
- Public free-scan endpoint rate-limited (3/IP/day, 10-min cooldown, 200/day global budget) and honest (discovery prompts only).

## 🔧 Deployment steps (must do once)

1. **Run SQL migrations** in the Supabase SQL editor, in order:
   - `supabase/schema.sql` (fresh projects only — already includes `scans.user_id`)
   - `supabase/add_user_plans.sql`
   - `supabase/add_polar_billing.sql`  ← billing columns for Polar (`polar_customer_id`, `polar_subscription_id`); renames the old Stripe columns if present.
   - `supabase/add_market_region.sql`
   - `supabase/add_scan_user_id.sql`  ← **critical** for existing projects: adds `scans.user_id` + backfills. Without it, scan creation fails.
   - `supabase/add_auto_scan.sql` ← adds `brands.auto_scan` + `last_auto_scan_at` for scheduled scans.

2. **Environment variables** (see `.env.example`): Supabase URL/anon/service-role, `OPENAI_API_KEY`, Polar (`POLAR_ACCESS_TOKEN`, `POLAR_SERVER`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRO_PRODUCT_ID`, `POLAR_MAX_PRODUCT_ID`), `RESEND_API_KEY`, `CRON_SECRET`, and `NEXT_PUBLIC_APP_URL` set to the **production domain**.

3. **Supabase Auth** → add `https://<your-domain>/**` to allowed redirect URLs.

4. **Polar.sh** → create the Pro ($9) and Max ($29) products, copy their product IDs into env. Add the webhook endpoint `https://<your-domain>/api/polar/webhook` (subscribe to `subscription.*` and `order.paid`) and copy the signing secret into `POLAR_WEBHOOK_SECRET`. Set `POLAR_SERVER=production` with a production org token.

5. **Vercel Cron** → `vercel.json` schedules `/api/cron` daily at 08:00 UTC; set `CRON_SECRET` so the route accepts the request.

## Verify locally
```
npm run lint    # clean
npm test        # 18 passing
npm run build   # compiles
```
