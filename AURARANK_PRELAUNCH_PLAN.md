# AuraRank — Pre-Launch Plan
**Version 1.0 | Created: May 2026**
**Goal: Build something users say is genuinely worth every rupee — not just a dashboard with numbers**

---

## What AuraRank Actually Does (Stay Grounded)

A business owner asks: *"Is AI sending my customers to me or to my competitors?"*

We answer that question honestly. We test the exact questions their customers ask AI, record what AI says, and tell them what to fix. That's it. Everything we build must serve that one goal.

---

## PART 1 — CRITICAL BUGS TO FIX (Before Any New Feature)

These are not optional. These make the product dishonest right now.

---

### Bug #1 — Fake Scores for Non-Existent Brands (CRITICAL)

**The problem:**
When someone types "dvhfdfdsrs" as a brand name, they get a score of 40-60/100. That's a lie. A brand that doesn't exist should score 0 or near 0.

**Why it happens:**
The prompt list includes brand-specific questions like:
- `"what is dvhfdfdsrs"`
- `"dvhfdfdsrs review"`
- `"is dvhfdfdsrs good"`

GPT responds to these by echoing the brand name back: *"I'm not familiar with dvhfdfdsrs, but here are some things to consider..."*

Our system detects `brandMentioned = true` because the response contains the string "dvhfdfdsrs". But this is NOT a real recommendation — it's GPT saying it doesn't know the brand.

Additionally, the sentiment scoring gives every brand 15 points by default (neutral sentiment = 50/100 × 0.3 weight) even when the brand was never genuinely recommended.

**The fix (3 changes):**

1. **Remove brand-name echo prompts from scoring** — prompts like "what is X", "X review", "is X good" always echo the brand name. They must NOT count toward the visibility score. Move them to a separate "brand awareness" check that only tells users if AI knows about them at all.

2. **Fix sentiment formula** — when brand is not mentioned in a prompt, that prompt's sentiment contribution should be ZERO, not 50 (neutral midpoint).

3. **Add "unfamiliar brand" detection** — if GPT says "I'm not aware of", "I don't have information about", "I'm not familiar with" in the same sentence as the brand, count it as NOT mentioned.

**Fix location:** `src/lib/analyzer.ts` → `analyzeMentions()` and `calculateVisibilityScore()`; `src/lib/prompts.ts` → separate brand-awareness prompts from discovery prompts.

---

### Bug #2 — Charts Appear and Disappear (Confusing)

**The problem:**
- Trend chart only shows with 2+ scans. First-time users see a blank area.
- Competitor chart only shows on Pro plan. Starter users see nothing.
- Users don't know why something is missing.

**The fix:**
- Always render chart containers. Show a proper placeholder that explains WHY it's empty and what will fill it.
- First scan → trend chart shows: *"Run one more scan to see your progress over time"*
- Starter plan → competitor chart shows: *"Upgrade to see how your competitors compare"* with blurred/mock chart behind it

---

### Bug #3 — Score Has No Context

**The problem:**
A user gets 38/100. Is that good? Bad? Average? They have no idea. Without context, the number is useless.

**The fix:**
Add industry benchmarks. Store aggregate anonymous averages per industry category. Show: *"Your score is 38. The average in your industry is 31. You're ahead of 60% of similar businesses."*

---

### Bug #4 — Opportunities Section Isn't Prominent Enough

**The problem:**
The most valuable section (prompts where competitors show up but you don't) is buried in a collapsible card. Most users never open it. This is the section that should make users say "oh wow, I had no idea."

**The fix:**
Make it the FIRST thing users see after their score — not collapsible, always open, with real conversational language.

---

## PART 2 — NEW FEATURES (Prioritized)

### Priority 1 — Must Have Before Launch

---

#### Feature A: Authentic Score Validation

When a brand scores above 40 with fewer than 2 genuine mentions (not echoes), show a warning:
*"Your brand was not clearly recognized by AI in most tests. This score reflects your industry presence, not active recommendations."*

This is honest. Users trust a product that tells them bad news clearly.

---

#### Feature B: One-Click AI Visibility Boost

**This is the killer feature. The thing that makes users tell their friends.**

**The concept:**
AI models (ChatGPT, Gemini, Perplexity) learn from web content. If a brand has specific types of structured content on their website, AI is far more likely to recommend them. We know what that content looks like. We generate it for them.

**What it generates (all in one click):**

1. **FAQ Section** — 8-10 questions customers actually ask, answered in a way AI can easily pick up. Example for a restaurant:
   - *"What makes [Brand] unique?"*
   - *"What cuisine does [Brand] specialize in?"*
   - *"Is [Brand] good for family dining?"*
   - Each answer is 2-3 sentences, factual, uses natural language AI can cite.

2. **Brand Bio Paragraph** — A 100-word description optimized for AI discovery. Mentions industry, location, what makes them different, who they serve. This goes in the About page or footer.

3. **Structured Data Snippet** — JSON-LD schema markup they can paste into their website's `<head>`. AI crawlers parse this directly.

4. **10 Key Facts List** — Short, factual statements about the brand. *"[Brand] has been serving [city] since 2019."* *"[Brand] specializes in [X] and serves [target customer]."* AI models love factual, citable statements.

**Expected improvement:** 15-25% score increase in the next scan, because:
- More structured information about the brand is now available for AI to find
- Natural language answers match how AI summarizes recommendations
- Schema markup makes the brand legible to AI crawlers

**How it works technically:**
- Call GPT with the brand's name, industry, website content (fetched), competitors, and location
- Generate all 4 pieces of content in one API call
- Show in a clean copy-paste UI with download option
- Store the generated content so users can regenerate after updating their website

**Where it lives:** Dashboard → "Boost My Score" card (visible on all plans, generate on Max)

---

#### Feature C: Actual AI Response Viewer

Right now users see "You were mentioned in 5/20 prompts." They cannot see WHAT AI actually said about them.

**What to add:**
Under each opportunity (prompt where competitor appeared but they didn't), show:
- The exact question tested
- The actual AI response (truncated, 200 chars)
- Highlighted: what competitor was said, where they should have been

This transforms an abstract number into a real, visceral moment: *"I literally just saw GPT recommend my competitor and not me."* That's what makes someone upgrade the same day.

---

#### Feature D: Industry Benchmark Score

Show where the user stands relative to their industry:
- Pull anonymous average score per industry from all scans in the DB
- Show a visual bar: *"You: 38 — Industry avg: 31 — Top 10%: 72"*
- This makes a score of 38 feel meaningful instead of random

---

### Priority 2 — First Month After Launch

---

#### Feature E: Scheduled Auto-Scans + Email Digest

**Pro plan:** Weekly scan every Monday. Email with score change.
**Max plan:** Daily scan available. Weekly email digest with trend, new opportunities, and which competitor moved.

Email content:
- Your score this week vs last week (+7 points — here's why)
- New opportunities discovered
- 3 quick actions you can take today

This is what makes users stay subscribed month after month. They see progress. They have a reason to log back in.

---

#### Feature F: Competitor Alerts

If a tracked competitor's mention count jumps significantly (tracked via the existing competitor_analysis data), send an alert:
*"Heads up — [Competitor] is now appearing in 3 more AI searches than last week. Here's what changed."*

This makes the product feel alive, not static.

---

#### Feature G: Progress-Linked Recommendations

Right now the Fix Plan is a generic list. It should be:
1. Tied to specific missing prompts
2. Sorted by expected impact
3. Marked as "Done" when the next scan shows improvement in that area

Example: Recommendation says *"Add FAQ content to your website."* After the user implements it and runs the next scan, the prompts that were previously missing are now showing results → the recommendation auto-marks as complete.

---

#### Feature H: Onboarding Tutorial (First-Time User Experience)

Right now new users see an empty dashboard and a "Add Brand" button. Many won't know what to do.

**Replace with:**
1. Welcome screen: *"Let's find out if AI knows about [brandName]"*
2. Guided brand setup (3 steps with explanations at each step)
3. While scan runs: explain what we're doing and why (progress with context)
4. After first scan: a guided walkthrough of results (highlight each metric with a tooltip explaining it in plain English)

---

### Priority 3 — 2-3 Months After Launch

- **Multi-location tracking** — franchise/chain businesses: track each city separately
- **Team accounts** — invite team members to view dashboard
- **CSV/PDF export** — downloadable reports for client reporting (agencies)
- **White-label** — agencies can brand it as their own tool
- **Zapier/webhook integration** — trigger workflows when score drops

---

## PART 3 — SCORING OVERHAUL (Make It Honest)

### Current formula (broken):
```
Score = mention_frequency (40%) + sentiment (30%) + position (30%)
```
Problem: Sentiment gives points even when brand is NOT mentioned.

### New formula:
```
Score = mention_frequency (50%) + position_when_mentioned (30%) + sentiment_when_mentioned (20%)
```

**Rules:**
- If mention_count = 0 → score cannot exceed 15 (floor for minimal industry presence)
- Brand-echo prompts ("what is X", "X review") are excluded from score calculation entirely
- Sentiment score only applies to prompts where brand was genuinely mentioned
- If AI response contains "not familiar", "don't have information", "unknown brand" near the brand name → NOT counted as a mention

### Score interpretation (update labels):
| Score | Label | Meaning |
|-------|-------|---------|
| 0-10 | Invisible | AI has no awareness of your brand |
| 11-25 | Very Low | AI mentions you occasionally in direct questions but not recommendations |
| 26-45 | Low | You appear sometimes but competitors dominate |
| 46-65 | Moderate | AI recommends you in relevant categories |
| 66-80 | Strong | AI actively and consistently recommends you |
| 81-100 | Dominant | You're a top recommendation in your category |

---

## PART 4 — TESTING PLAN (Before Any Production Release)

### Test Group 1 — Known Large Brands (Should score 65+)
- McDonald's (Restaurant)
- Nike (Retail)
- HubSpot (SaaS/Marketing)
- Marriott (Hotel)

Expected: 65-90/100. If below 50, our prompts are wrong.

### Test Group 2 — Real But Small Brands (Should score 15-45)
- A real local restaurant with a functional website
- A small SaaS tool with some online presence
- A boutique hotel with reviews on Google

Expected: 15-45/100. If above 60, our scoring is inflated.

### Test Group 3 — Fake/Nonsense Brands (Should score 0-10)
- "dvhfdfdsrs"
- "xkqzpwmnvb"
- "qqqqqqqqqq"
- "testbrand123xyz"

Expected: 0-10/100. If above 10, the fake-score bug is NOT fixed.

### Test Group 4 — Edge Cases
- Brand name that is also a common word (e.g., "Apple" in food industry vs tech)
- Very long brand names (50+ characters)
- Brand names with special characters
- Non-English brand names

### Test Group 5 — Plan Enforcement
- Starter plan: try to create 2 brands → should block at 1
- Starter plan: try to run 2 scans in same month → should block at 1
- Call API directly without auth → should return 401
- Call POST /api/scans with valid auth but exhausted quota → should return 403

### Test Group 6 — One-Click Boost Validation
1. Take a real small brand with score of ~25
2. Implement the generated content on a test website
3. Re-scan after 48 hours
4. Verify score improvement of at least 10-15 points

---

## PART 5 — WHAT MAKES USERS STAY (Retention)

Users cancel when they see the same number every week and nothing changes.

Users stay when:
1. They see their score **improving** after implementing suggestions
2. They get **alerts** that feel urgent and relevant
3. The **one-click boost** actually works (and they can see it in the next scan)
4. The product tells them something they **could not have known any other way**

The product must be designed around the moment of insight: *"I had no idea GPT was recommending my competitor and not me for this search."* Every feature must lead users back to that moment or deepen it.

---

## PART 6 — PRE-LAUNCH CHECKLIST

### Technical
- [ ] Fix fake score bug (brand-echo prompts excluded from scoring)
- [ ] Fix sentiment formula (zero out when brand not mentioned)
- [ ] Add "unfamiliar brand" detection in response analysis
- [ ] Fix chart placeholder states (never show blank, always show reason)
- [ ] Add industry benchmark data
- [ ] Build One-Click Boost content generator
- [ ] Build AI Response Viewer (show actual GPT response under each missed prompt)
- [ ] Server-side plan enforcement on all API routes (DONE)
- [ ] Email confirmation redirect works in both dev and prod (DONE)
- [ ] Verify all Supabase RLS policies block cross-user data access
- [ ] Set NEXT_PUBLIC_APP_URL to production domain in prod env
- [ ] Add `https://yourdomain.com/**` to Supabase allowed redirect URLs

### Product
- [ ] Onboarding tutorial for first-time users
- [ ] Score interpretation labels updated (not just numbers)
- [ ] Opportunities section always expanded by default (not collapsible)
- [ ] Mobile UI tested on real devices
- [ ] All buttons clickable on mobile (ExitIntent removed — DONE)
- [ ] Signup button visible on mobile (DONE)

### Validation
- [ ] Run all 6 test groups above and document results
- [ ] At least 5 real users test the product before launch
- [ ] One-click boost tested with a real website
- [ ] Razorpay subscription flow tested end-to-end
- [ ] Email notifications tested (scan complete email)

### Content / Copy
- [ ] Landing page copy is honest (no "4 AI models" claim — DONE)
- [ ] Score explanation visible on dashboard (i button — DONE)
- [ ] Every error message is human-readable (no raw DB errors)
- [ ] Pricing page matches actual feature set

---

## PART 7 — THE HONEST PRODUCT PROMISE

When a user signs up and pays, they should be able to say:

> *"I now know exactly which AI searches my competitors are winning and I'm not. I have a specific list of things to do. And I have ready-made content I can put on my website today that should improve my score in the next scan."*

If they cannot say that after their first paid scan, we have failed.

The metrics we should track internally:
- % of users who run a second scan (shows they believe in the product)
- % of users who implement at least one recommendation (shows the fix plan is actionable)
- % of users who see score improvement between scan 1 and scan 2 (shows the product works)
- Monthly churn rate (should be below 8% if the product genuinely helps)

---

## IMPLEMENTATION ORDER (What to Build Next)

**Week 1:**
1. Fix fake score bug (highest trust issue)
2. Fix sentiment formula
3. Fix chart placeholder states
4. Add industry benchmark display

**Week 2:**
1. Build One-Click Boost content generator
2. Build AI Response Viewer (show actual GPT responses)
3. Build onboarding tutorial

**Week 3:**
1. Scheduled auto-scans
2. Weekly email digest
3. Competitor alerts

**Week 4:**
1. Full testing (all 6 test groups)
2. Fix any issues found in testing
3. Production deployment with correct env vars

**Launch when:**
- Fake brand scores 0-10 ✓
- Real known brand scores 65+ ✓
- One-Click Boost generates useful content ✓
- Onboarding tutorial is live ✓
- 5 real users have tried it and said it's useful ✓

---

*This document should be reviewed before any production deployment. If any item in the Pre-Launch Checklist is not complete, do not launch that feature.*
