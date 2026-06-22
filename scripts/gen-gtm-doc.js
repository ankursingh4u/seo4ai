// Generates SEO4AI_Product_GTM.docx from the product/GTM content.
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle,
} = require('docx')

const ACCENT = '4F46E5'
const MUTED = '64748B'

const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 280, after: 120 }, children: [new TextRun({ text: t, bold: true, color: ACCENT })] })
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 }, children: [new TextRun({ text: t, bold: true })] })
const P = (t, opts = {}) => new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: t, ...opts })] })
const lead = (label, rest) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true }), new TextRun({ text: rest })] })
const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t })] })
const numbered = (t, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 40 }, children: [new TextRun({ text: t })] })

function cell(text, { bold = false, header = false, align } = {}) {
  return new TableCell({
    shading: header ? { fill: ACCENT } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold: bold || header, color: header ? 'FFFFFF' : undefined, size: 20 })] })],
  })
}
function table(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((r, i) => new TableRow({ tableHeader: i === 0, children: r.map((c, j) => cell(c, { header: i === 0, align: j === 0 ? AlignmentType.LEFT : AlignmentType.CENTER })) })),
  })
}

const children = []

// Title block
children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'SEO4AI', bold: true, size: 56, color: ACCENT })] }))
children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Product & Go-To-Market', size: 30, color: MUTED })] }))
children.push(new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Live: https://seo4ai.bolddev.live', italics: true, color: MUTED })] }))
children.push(P('SEO4AI tells you whether AI assistants (ChatGPT, Gemini, Perplexity, Claude) recommend your brand — it scores your AI visibility, shows where competitors beat you, and gives you the exact fixes.'))

// 1
children.push(H1('1. The shift we are built on'))
children.push(P('People used to Google "best CRM for startups." Now they ask ChatGPT — and the AI names three brands. If you are not one of them, you are invisible, and you will never even see the lost traffic in your analytics.'))
children.push(P('This new discipline has a name: GEO / AEO (Generative / Answer Engine Optimization) — "SEO for AI." It is where SEO was around 2004: real, growing fast, and most brands have no idea where they stand. SEO4AI is the measurement and action layer for it.'))

// 2
children.push(H1('2. What we provide'))
;[
  'AI Visibility Score (0–100) — how often AI recommends you across real buyer questions.',
  'Multi-prompt testing — we run the actual questions customers ask, not vanity queries.',
  'Competitor gap analysis — see exactly who AI recommends instead of you, and by how much.',
  'Missed searches — questions where rivals appear and you do not (your hit-list).',
  'AI Fix Plan — prioritized, specific actions to climb (Max plan).',
  'Boost content generator — ready-to-paste FAQ, brand bio, key facts, and JSON-LD schema (Max plan).',
  'Progress tracking + competitor alerts — visibility over time; know when you slip or a rival surges.',
  'Shareable report cards — every report renders a branded score card on social.',
  'Region targeting — results tuned to a country/state/city market.',
].forEach(t => children.push(bullet(t)))

// 3
children.push(H1('3. Who our target customer is'))
children.push(H2('Primary (highest intent, can pay)'))
children.push(lead('SEO & marketing agencies — ', 'need a new service line and a wedge to win clients ("your AI visibility is 12 — here is the audit"). Recurring, multi-brand, will pay for Max.'))
children.push(lead('B2B SaaS marketers / founders — ', 'buyers research via AI; being un-recommended kills pipeline.'))
children.push(lead('DTC / e-commerce brands — ', 'category discovery ("best magnesium supplement") increasingly happens in AI.'))
children.push(H2('Secondary'))
children.push(bullet('Local high-ticket services — med-spas, dental, law, clinics ("best dentist in Austin").'))
children.push(bullet('Content / affiliate sites — want citations in AI answers.'))
children.push(P('Buyer personas: Head of Growth / SEO Manager / Agency Owner / Indie Founder.', { italics: true, color: MUTED }))

// 4
children.push(H1('4. Why people will use it'))
children.push(lead('Fear of invisibility: ', '"Is AI sending my customers to competitors?" — the scan answers it in 10 seconds, specifically, about them.'))
children.push(lead('Measurable and new: ', 'nobody has this number yet; first-movers want it.'))
children.push(lead('Actionable: ', 'not just a score — a fix plan and ready-made content.'))
children.push(lead('Low friction: ', 'free instant scan, no card. The result is scary enough to drive signup.'))

// 5
children.push(H1('5. Pricing / what we are offering'))
children.push(table([
  ['Feature', 'Starter (Free)', 'Pro ($9/mo)', 'Max ($29/mo)'],
  ['Brands', '1', '3', '10'],
  ['Scans / month', '3', '15', '60'],
  ['AI Visibility Score', 'Yes', 'Yes', 'Yes'],
  ['Competitor gap + history', '—', 'Yes', 'Yes'],
  ['AI Fix Plan', '—', '—', 'Yes'],
  ['Boost generator + export', '—', '—', 'Yes'],
]))
children.push(P('Free is the acquisition engine; Pro is the prosumer/founder tier; Max is the agency/serious-brand tier (and the real margin).', { italics: true, color: MUTED }))

// 6
children.push(H1('6. Market size (honest estimates)'))
children.push(bullet('Global SEO software/services: roughly $80–90B and growing.'))
children.push(bullet('AI is reshaping search fast: ChatGPT reached hundreds of millions of weekly users; a large and rising share of high-intent discovery is moving to AI assistants.'))
children.push(bullet('GEO/AEO tools are a brand-new sub-category (Profound, Peec, Otterly, and others all launched recently) — early, fragmented, no clear leader yet. That is the opportunity.'))
children.push(H2('Framing for SEO4AI (bootstrapped, realistic)'))
children.push(lead('TAM: ', 'the slice of $80B+ SEO spend that shifts to AI-visibility tooling over the next few years — plausibly a multi-$B category.'))
children.push(lead('SAM: ', 'agencies + SMB SaaS/DTC/local brands worldwide who would pay $9–$29/mo — millions of businesses.'))
children.push(lead('SOM (what to chase): ', '1,000 paying customers at ~$15 blended ARPU = ~$180k ARR — achievable bootstrapped, and only a sliver of the SAM.'))
children.push(P('The point is not the big number — it is that the category is forming right now, and timing is the edge.', { italics: true, color: MUTED }))

// 7
children.push(H1('7. How to get the first 100 customers'))
children.push(P('The product’s output IS the pitch. Lead with the result, not the features.'))
children.push(H2('Phase 1 — First 1–10 (this week, founder-led, $0)'))
children.push(numbered('Pick ONE narrow niche (e.g., Shopify skincare brands, B2B HR-SaaS, or med-spas in one city).', 'p1'))
children.push(numbered('Scan 30–50 of them yourself; note score + who beats them.', 'p1'))
children.push(numbered('Send the result, not a pitch: "I tested what ChatGPT recommends for [niche]. [Competitor] showed up 9x; you showed up 1x. Full breakdown: [report link]. Want the 5 fixes?"', 'p1'))
children.push(numbered('Expect 3–8 replies, 1–3 first users. If zero, fix the niche/message — not the product.', 'p1'))
children.push(H2('Phase 2 — To ~50 (content + community, organic)'))
children.push(numbered('Public teardowns / leaderboards: "I asked ChatGPT 25 buying questions about [niche] — here is who it recommends." Post on LinkedIn, X, r/SEO, r/marketing, Indie Hackers, niche Slacks.', 'p2'))
children.push(numbered('SEO content targeting buyer searches: "is my brand on ChatGPT," "how to rank in AI search," "GEO checklist."', 'p2'))
children.push(numbered('Shareable score cards (built in) — every user who shares becomes a billboard.', 'p2'))
children.push(H2('Phase 3 — To 100 (channels + launch)'))
children.push(numbered('Agency partnerships — one agency resells AI-visibility audits to its whole client base. White-label / affiliate deal.', 'p3'))
children.push(numbered('Product Hunt + directories (BetaList, AI tool directories, Indie Hackers) with a strong demo GIF.', 'p3'))
children.push(numbered('Cold-email at scale — productize Phase 1 with a batch-outreach tool (paste 50 brands, get 50 personalized emails).', 'p3'))

// 8
children.push(H1('8. Most efficient marketing (ranked, free-first)'))
children.push(numbered('The free scan as a weapon (cold + warm) — personalized "your competitor beats you" outreach. Cheapest, highest-converting. Do this first.', 'm'))
children.push(numbered('Shareable report cards — built-in virality, $0, compounds.', 'm'))
children.push(numbered('Public leaderboards / teardowns — best organic flywheel (SEO + social + brands self-promote their rank).', 'm'))
children.push(numbered('Build-in-public on LinkedIn/X — the GEO topic is trending; founder posts get free reach.', 'm'))
children.push(numbered('Agency channel — highest revenue leverage; one partner brings many paying brands.', 'm'))
children.push(numbered('Community seeding (Reddit / Indie Hackers / Slack) — genuine, helpful posts with a free-scan offer.', 'm'))
children.push(numbered('Paid ads LAST — only after the message/niche is proven; retarget free-scan users who did not sign up.', 'm'))
children.push(P('Rule of thumb: spend nothing on ads until 30 personalized cold scans produce real interest. The free scan + shareable cards + teardown content can realistically carry you to the first 100 with $0 media spend.', { bold: true }))

// 9
children.push(H1('9. The 30-day starter plan'))
children.push(bullet('Week 1: pick niche; scan 50; send 50 personalized emails; post 1 teardown.'))
children.push(bullet('Week 2: follow up; ship 2 SEO blog posts; DM 20 agencies.'))
children.push(bullet('Week 3: Product Hunt / directories; post a weekly leaderboard.'))
children.push(bullet('Week 4: double down on whatever channel produced signups; turn on real billing once people are actively using it.'))
children.push(lead('North-star for the month: ', '1,000 free scans, 100 signups, 10–20 paying. Then scale the channel that worked.'))

const numbering = {
  config: ['p1', 'p2', 'p3', 'm'].map(ref => ({
    reference: ref,
    levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START, style: { run: { bold: false } } }],
  })),
}

const doc = new Document({
  numbering,
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
  },
  sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
})

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, '..', 'SEO4AI_Product_GTM.docx')
  fs.writeFileSync(out, buf)
  console.log('Wrote', out, '(' + buf.length + ' bytes)')
})
