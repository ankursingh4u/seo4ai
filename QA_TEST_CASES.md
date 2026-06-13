# AuraRank — QA Test Cases (step by step)

Live: **https://aurarank-five.vercel.app**

## Test accounts (pre-confirmed, work immediately)
| Role | Email | Password | Notes |
|---|---|---|---|
| Free / Starter | `testfree@aurarank.app` | `AuraFree2026!` | plan = starter |
| Pro | `testpro@aurarank.app` | `AuraPro2026!` | plan = pro (set directly) |

## Plan limits (source of truth: `src/lib/payment.ts`)
| | Starter (free) | Pro ($9) | Max ($29) |
|---|---|---|---|
| Brands | 1 | 3 | 10 |
| Scans / month | 3 | 15 | 60 |
| Competitor scores | ✗ | ✓ | ✓ |
| Progress history | ✗ | ✓ | ✓ |
| AI Fix Plan | ✗ | ✗ | ✓ |
| Boost generator / Export | ✗ | ✗ | ✓ |

> ⚠️ Billing is on the **production** Polar org — completing a checkout charges a **real card**. For checkout tests, stop at the Polar page; don't pay. `POLAR_WEBHOOK_SECRET` is still a placeholder, so a real purchase will **not** auto-upgrade the plan until the webhook is configured. The Pro test user lets you verify all Pro features without paying.

Mark each: ✅ pass / ❌ fail / ⏭️ skipped.

---

## 1 — Public homepage & free scan (no login)

**TC-1.1 Homepage loads**
1. Open `https://aurarank-five.vercel.app/`.
- Expect: hero + free-scan widget render, no console errors.

**TC-1.2 Free scan returns a score**
1. In the free-scan widget enter Brand `Notion`, Industry `project management`.
2. Click scan, wait ~10s.
- Expect: AI Visibility Score (0–100), per-prompt breakdown (which prompts mentioned the brand), and a sign-up nudge for the full report.

**TC-1.3 Honesty — fake brand scores low**
1. Free scan with Brand `Zxqwplfake`, Industry `CRM software`.
- Expect: score in the 0–10 range, no fabricated mentions.

**TC-1.4 Rate limit**
1. Run the free scan 4+ times quickly from the same browser.
- Expect: after 3/day it's blocked with a friendly "limit reached / cooldown" message (not a crash).

---

## 2 — Registration & email verification

**TC-2.1 Signup validation**
1. Go to `/signup`. Enter password `123` → submit.
- Expect: "Password must be at least 8 characters".
2. Enter mismatched password + confirm.
- Expect: "Passwords do not match".

**TC-2.2 Signup success + confirmation email**
1. Sign up with a **real inbox you control** (e.g. `you+aura1@gmail.com`), password ≥ 8 chars.
- Expect: "check your email" success screen showing the address.
2. Open the email → click the confirmation link.
- Expect (after Supabase Site URL fix): link opens `https://aurarank-five.vercel.app/...` → lands on `/dashboard`. **❌ if it opens `localhost:3000`** (means Supabase Site URL still not set).

**TC-2.3 Duplicate email**
1. Sign up again with an email that already exists.
- Expect: "An account with this email already exists. Try signing in instead."

---

## 3 — Login, logout, password reset

**TC-3.1 Login (Free user)**
1. `/login` → `testfree@aurarank.app` / `AuraFree2026!`.
- Expect: redirect to `/dashboard`.

**TC-3.2 Wrong password**
1. Login with a bad password.
- Expect: friendly error, stays on login.

**TC-3.3 Protected route while logged out**
1. Log out. Visit `/dashboard/billing` directly.
- Expect: redirected to `/login` (no flash of private content).

**TC-3.4 Forgot password**
1. `/forgot-password` → submit your email.
- Expect: confirmation that a reset link was sent (link should also point to the prod domain after the Site URL fix).

---

## 4 — Onboarding & first scan (use Free user)

**TC-4.1 Add first brand**
1. Logged in as Free, on `/dashboard` fill the brand form: Brand name, Industry (e.g. `CRM software`), Website (optional), up to 3 competitors, Region.
2. Save.
- Expect: brand saved, first scan starts automatically.

**TC-4.2 First results render**
1. Wait ~20–30s.
- Expect: Visibility Score, Brand Mentions (e.g. 8/20), Quick Wins / prompt opportunities, no blank charts (placeholders shown instead).

**TC-4.3 AI response viewer**
1. Expand a missed-search opportunity.
- Expect: the actual AI response text is shown.

---

## 5 — Free-tier gating (Free user)

**TC-5.1 Competitor scores locked**
1. On the dashboard, find the competitor chart.
- Expect: shows an upgrade CTA (not real competitor scores).

**TC-5.2 AI Fix Plan locked**
- Expect: Fix Plan area shows upgrade prompt, not the plan.

**TC-5.3 Brand limit (1)**
1. Try to add a 2nd brand.
- Expect: blocked with "Brand limit reached (1/1). Upgrade…".

**TC-5.4 Scan quota (3/mo)**
1. Run scans until 3 are used this month, then try a 4th.
- Expect: "Scan limit reached (3/3 this month). Upgrade…".

---

## 6 — Pro features (use Pro user)

**TC-6.1 Plan shows Pro**
1. Log in as `testpro@aurarank.app`. Go to `/dashboard/billing`.
- Expect: current plan badge = **Pro**; scans-used line shows `/15`.

**TC-6.2 Competitor analysis unlocked**
1. Add a brand with 2–3 competitors, run a scan.
- Expect: competitor gap bar chart shows real mention counts (no upgrade lock).

**TC-6.3 Progress history**
1. Run a 2nd scan on the same brand.
- Expect: trend line plots both scans.

**TC-6.4 More brands**
1. Add up to 3 brands.
- Expect: allowed; the 4th is blocked ("3/3").

**TC-6.5 Max-only still locked for Pro**
- Expect: AI Fix Plan and Boost generator remain locked (Max only) for the Pro user.

---

## 7 — Billing (Polar checkout & portal)

**TC-7.1 Plans page renders**
1. As Free user → `/dashboard/billing`.
- Expect: 3 plan cards (Starter/Pro/Max), Starter marked current, Pro "Popular".

**TC-7.2 Upgrade → real Polar checkout** *(do NOT pay)*
1. Click **Upgrade to Pro**.
- Expect: redirect to `https://polar.sh/checkout/...` showing **$9 PRO**. ✅ then close the tab. (Repeat for **Max** → $29.)

**TC-7.3 Checkout server guard**
1. Logged out, `POST /api/polar/checkout` with `{"plan":"pro"}` (or just confirm the button needs login).
- Expect: 401 Unauthorized.

**TC-7.4 Manage subscription (portal)**
1. As Pro user, on billing click **Manage Subscription**.
- Expect: either opens the Polar customer portal, OR a clean "No active subscription found" (expected here, because the Pro user's plan was set manually and has no Polar subscription — should **not** 500).

**TC-7.5 Webhook endpoint alive**
- `POST /api/polar/webhook` with a bad signature → expect **403** (not 500). *(Already verified.)*

> Full paid loop (pay → auto-upgrade) can only be tested after a real `POLAR_WEBHOOK_SECRET` is set, ideally in a Polar **sandbox** org to avoid real charges.

---

## 8 — Settings & scheduled scans

**TC-8.1 Settings loads**
1. `/dashboard/settings`.
- Expect: account info + "Scheduled Auto-Scans" toggle per brand.

**TC-8.2 Auto-scan gating**
- Expect: Free can't enable auto-scan; Pro = weekly; Max = daily (per plan).

---

## 9 — Share report

**TC-9.1 Generate share link**
1. On a brand's results, click **Share Report**.
- Expect: a public link is created.
2. Open it in an incognito window.
- Expect: read-only report renders without login.

---

## 10 — Security / negative checks (API guards)

| Test | Request (logged out) | Expect |
|---|---|---|
| TC-10.1 | `GET /api/user/plan` | 401 |
| TC-10.2 | `POST /api/polar/checkout` | 401 |
| TC-10.3 | `POST /api/scans` | 401 |
| TC-10.4 | `POST /api/brands` | 401 |
| TC-10.5 | `GET /api/cron` without secret | 401 |
| TC-10.6 | `POST /api/polar/webhook` bad sig | 403 |

---

## Sign-off
- [ ] Sections 1–4 (public + auth + onboarding)
- [ ] Section 5 (free gating)
- [ ] Section 6 (Pro features)
- [ ] Section 7 (billing)
- [ ] Sections 8–10 (settings, share, security)

**Blocking prerequisites for a full pass:** Supabase Site URL + redirect allowlist set (TC-2.2), `add_polar_billing.sql` run, and — for the paid loop only — a real `POLAR_WEBHOOK_SECRET`.
