# AuraRank — Tester Guide

**App:** https://aurarank-five.vercel.app
**What it does:** Tells you whether AI tools (ChatGPT etc.) recommend your brand, scores your AI visibility, shows competitor gaps, and how to fix it.

> 💳 **Billing is in TEST MODE** — run the entire paid workflow for free.
> **Test card:** `4242 4242 4242 4242` · expiry any future date (`12/30`) · CVC any 3 digits (`123`) · name/zip anything. **No real money is ever charged.**

How to use this guide: do Parts 1–5 once, then go through the **three plan sections (A/B/C)** in order — each lists *exactly* what you should see in that plan. Upgrade between them using Part 6. Mark each line ✅ / ❌.

---

## Part 1 — Sign up & email verification
1. Open the app → **Sign up**.
2. Password `123` → ❗ should show **"min 8 characters"**.
3. Real email + 8+ char password → see **"check your email"** screen.
4. Open the email → click the link → ✅ opens **aurarank-five.vercel.app** (NOT localhost) and logs you in.

## Part 2 — Login / logout
- Log out → open `/dashboard` directly → ✅ bounced to login.
- Log back in → ✅ dashboard. Wrong password → ✅ friendly error, no crash.

## Part 3 — Free scan (no login, homepage)
- Brand `Notion`, Industry `project management` → ✅ score (0–100) + per-prompt breakdown.
- Fake brand `Zxqwplfake` → ✅ scores very low (0–10), no fake mentions.

## Part 4 — Add a brand + first scan
- Fill the brand form (name, industry, up to 3 competitors, region) → Save.
- ✅ Auto-scan runs (~20–30s) → you get a Visibility Score and metrics.

---

# 🔑 The core test: verify each PLAN shows the right features

You start on **Starter (free)**. Go through Section A now. Then upgrade (Part 6) and do B, then C.

## ▣ SECTION A — STARTER (Free) — what you SHOULD see
On the dashboard after a scan:
- ✅ **Visibility Score** ring + score card (`/100`).
- ✅ **AI Mention Rate** card (e.g. "Found in 8/20 AI responses").
- ✅ **Missed Searches** list — questions where competitors appear, with **"See what AI actually said"** expanders.
- ✅ **Industry Benchmark** bar (you vs avg vs top 10%).
- ✅ **Run Scan** button shows a counter like **`Run Scan (1/3)`**.

What should be **LOCKED** on Starter:
- 🔒 **"vs Competitors"** metric card shows **"Locked"** + **"Upgrade to see →"**.
- 🔒 **Competitor Comparison Chart** is a blurred placeholder with an **"Upgrade to Pro"** button.
- 🔒 **"Boost My Score"** section shows a **"Max Plan"** badge; its button reads **"Upgrade to Generate"**.
- 🔒 **"AI Fix Plan"** section shows a **"Max Plan"** badge (no plan generated).

Limits to confirm:
- 🔒 Add a **2nd brand** → blocked: **"brand limit (1/1)"**.
- 🔒 After **3 scans** this month, a 4th → blocked: **"used all 3 scans"** + sent to billing.

## ▣ SECTION B — PRO ($9) — what UNLOCKS
After upgrading to Pro (Part 6B), run a scan on a brand **with competitors**:
- ✅ **"vs Competitors"** card now shows **Winning / Tied / Behind** with real numbers (e.g. "You: 8 · Rival: 5").
- ✅ **"Head-to-Head: AI Mentions"** bar chart shows real bars (no upgrade lock).
- ✅ **"Your Progress Over Time"** line chart appears after your **2nd** scan on a brand.
- ✅ **Run Scan** counter is now **`/15`**.
- ✅ You can add up to **3 brands** (4th blocked).

Still locked on Pro (Max-only):
- 🔒 **"Boost My Score"** still shows **"Max Plan"** / "Upgrade to Generate".
- 🔒 **"AI Fix Plan"** still shows **"Max Plan"** badge.

## ▣ SECTION C — MAX ($29) — what UNLOCKS
After upgrading to Max (Part 6D):
- ✅ **"Boost My Score"** button now reads **"Generate Boost Content"**. Click it → produces 4 tabs: **FAQ**, **Brand Bio**, **Key Facts**, **Schema (JSON-LD)**, each with a **Copy** button.
- ✅ **"AI Fix Plan"** — no Max badge. Expand it / generate → a list of action items each with **priority** (high/med/low), **difficulty**, **impact**, and a **checkbox** to mark done (state persists on re-scan).
- ✅ **Run Scan** counter is now **`/60`**.
- ✅ You can add up to **10 brands**.

### Quick reference — who gets what
| Feature (UI label) | Starter | Pro | Max |
|---|---|---|---|
| Visibility Score, Mention Rate, Missed Searches, Benchmark | ✅ | ✅ | ✅ |
| Region targeting | ✅ | ✅ | ✅ |
| "vs Competitors" card + "Head-to-Head" chart | 🔒 | ✅ | ✅ |
| "Your Progress Over Time" trend (2+ scans) | 🔒 | ✅ | ✅ |
| "Boost My Score" generator | 🔒 | 🔒 | ✅ |
| "AI Fix Plan" actions | 🔒 | 🔒 | ✅ |
| Brands | 1 | 3 | 10 |
| Scans / month | 3 | 15 | 60 |

---

## Part 6 — 💳 BILLING WORKFLOW (free, test card) — use this to move between sections
1. **Billing page** → ✅ three cards: Starter (current), Pro $9 (Popular), Max $29.
2. **6B — Upgrade to Pro:** click **Upgrade to Pro** → Polar checkout shows **$9** → pay with test card → ✅ back on billing, plan = **Pro**, counter `/15`. *(Now do Section B.)*
3. **6D — Upgrade to Max:** **Upgrade to Max** → pay test card → ✅ plan = **Max**, counter `/60`. *(Now do Section C.)*
4. **6E — Manage subscription:** **Manage Subscription** → ✅ opens Polar customer portal with active sub + invoices.
5. **6F — Cancel:** cancel in the portal → back to AuraRank → ✅ status updates; once it ends, Pro/Max features re-lock and plan returns to Starter.

## Part 7 — Share a report
- On a brand's results click **Share Report** → open the link in incognito → ✅ read-only report loads, no login.

## Part 8 — General polish (flag anything off)
Fast loads · no console errors · mobile layout OK · friendly error messages · loading spinners/skeletons (never blank screens).

---

## 🐞 Bug report template
**Where** (page/URL + what you clicked) · **Steps** · **Expected** · **Got** (+screenshot) · **Account email + plan** · **Browser/device**

---
*Quick-start accounts (optional, already verified): Free `testfree@aurarank.app` / `AuraFree2026!` · Pro `testpro@aurarank.app` / `AuraPro2026!`. For a clean run, sign up your own account in Part 1.*
