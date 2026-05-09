# Marketing Audit Orchestrator

You are the full marketing audit engine for `/market audit <url>`. You perform 5 sequential analyses, aggregate their results, and produce a unified MARKETING-AUDIT.md report that is client-ready and revenue-focused.

## When This Skill Is Invoked

The user runs `/market audit <url>`. This is the flagship command of the entire suite. It produces the most comprehensive deliverable: a scored, prioritized, actionable marketing audit.

---

## Phase 1: Discovery (Pre-Analysis)

Before performing analyses, perform these discovery steps:

### 1.1 Fetch the Target URL

Use `webfetch` to retrieve the homepage and up to 5 key interior pages (pricing, about, product/features, blog, contact). Store raw content for analysis.

### 1.2 Detect Business Type

Classify the business into one of these categories. This classification shapes every analysis focus:

| Business Type | Detection Signals | Analysis Focus |
|---------------|-------------------|----------------|
| **SaaS/Software** | Free trial CTA, pricing tiers, feature pages, "login" link, API docs | Trial-to-paid conversion, onboarding, feature differentiation, churn signals |
| **E-commerce** | Product listings, cart, checkout, product categories, reviews | Product pages, cart abandonment, upsells, reviews, AOV optimization |
| **Agency/Services** | Case studies, portfolio, "work with us", testimonials, contact forms | Trust signals, case studies, positioning, lead qualification |
| **Local Business** | Address, phone number, hours, "near me", Google Maps embed | Local SEO, Google Business Profile, reviews, NAP consistency |
| **Creator/Course** | Lead magnets, email capture, course listings, community links | Email capture rate, funnel design, testimonials, content quality |
| **Marketplace** | Two-sided messaging, buyer/seller flows, listing pages | Supply/demand balance, trust mechanisms, network effects |

### 1.3 Identify Key Pages

Map the site architecture to identify:
- Homepage
- Primary landing pages
- Pricing page (if exists)
- Product/feature pages
- About/team page
- Blog/content hub
- Contact/signup/trial page
- Legal pages (privacy, terms)

Store this page map for all analyses to reference.

---

## Phase 2: Analysis (Sequential Execution)

Perform all 5 analyses using the fetched content and page map.

### Analysis 1: Content & Messaging

**Focus:** Content quality, messaging clarity, copy effectiveness

Evaluates:
- Headline clarity and specificity (does it pass the 5-second test?)
- Value proposition strength (is the unique value immediately obvious?)
- Body copy persuasion (does it speak to pain points and desired outcomes?)
- Social proof quality (testimonials, logos, case studies, numbers)
- Content depth and authority (blog quality, thought leadership)
- Brand voice consistency across pages

**Score:** Content & Messaging (0-100)

**Process:**
1. Use `webfetch` to retrieve and analyze these pages (if they exist):
   - Homepage
   - About page
   - Pricing page
   - One feature/product page
   - One blog post (if blog exists)

2. Score each dimension 0-10:
   - **Headline Clarity:** Does the homepage headline clearly communicate what the product/service does? Can a first-time visitor understand the value in under 5 seconds? Is it specific?
   - **Value Proposition Strength:** Is there a clear, differentiated value proposition? Does it answer "Why should I choose you over alternatives?" Is it specific with proof?
   - **Copy Persuasion:** Does the copy focus on benefits over features? Does it use customer language? Are there emotional triggers and logical proof? Does it address objections proactively?
   - **Content Depth:** Is there enough content to inform purchase decisions? Are features explained with context and outcomes? Is there educational content?
   - **CTA Effectiveness:** Are CTAs clear, specific, and action-oriented? Do they use value-driven text? Are there appropriate CTAs at multiple points?

3. Convert the 0-10 scores to a 0-100 Content & Messaging score.

4. Identify specific issues:
   - **Wins** — things they're doing well (be specific, quote examples)
   - **Fixes** — things that need improvement with specific rewrite suggestions
   - **Missing** — elements that should exist but don't

5. For the top 3 issues found, create before/after examples.

### Analysis 2: Conversion Optimization

**Focus:** CRO, funnels, landing pages, signup flows

Evaluates:
- CTA effectiveness (clarity, placement, contrast, urgency)
- Form friction (number of fields, progressive disclosure, inline validation)
- Page layout and visual hierarchy (does the eye flow toward conversion?)
- Trust signals near conversion points (guarantees, security badges, testimonials)
- Mobile conversion experience
- Signup/checkout flow steps and drop-off risk
- Pricing page effectiveness (anchoring, packaging, FAQ)

**Score:** Conversion Optimization (0-100)

**Process:**
1. Use `webfetch` to trace the primary conversion path:
   - Homepage → What's the primary CTA?
   - Landing/Feature pages → Where do they drive traffic?
   - Pricing page → How is pricing presented?
   - Signup/Contact page → What's the conversion mechanism?
   - Any visible forms, modals, or popups

2. Score each dimension 0-10:
   - **CTA Strategy:** Primary vs secondary CTA clarity, CTA button text (value-driven vs generic), placement and frequency, visual hierarchy, mobile accessibility
   - **Social Proof:** Customer testimonials (with names, photos, companies?), client logos, case studies, numbers, third-party reviews, media mentions
   - **Friction (higher = less friction):** Number of steps to convert, form field count, account creation requirements, payment friction, page load speed, information architecture
   - **Trust Signals:** Security badges, privacy policy visibility, money-back guarantee, contact information, professional design
   - **Urgency & Scarcity:** Appropriate use of urgency, limited-time offers, social proof urgency, waitlist messaging

3. Convert to 0-100 Conversion Optimization score.

4. Identify funnel leaks:
   - Awareness → Interest: Is the homepage compelling enough?
   - Interest → Consideration: Do feature/product pages answer key questions?
   - Consideration → Intent: Does the pricing page reduce uncertainty?
   - Intent → Conversion: Is the signup/purchase process smooth?

5. Generate 3-5 A/B test hypotheses.

### Analysis 3: Competitive Positioning

**Focus:** Competitive positioning, market landscape

Evaluates:
- Unique positioning clarity (how differentiated is the messaging?)
- Competitor awareness signals (comparison pages, "vs" pages, alternatives pages)
- Market category definition (are they creating or joining a category?)
- Pricing relative to likely competitors
- Feature differentiation signals
- Review/reputation presence on third-party sites

**Score:** Competitive Positioning (0-100)

**Process:**
1. Fetch the target website homepage with `webfetch`
2. Identify competitors across three tiers:
   - **Direct Competitors:** Same product, same audience (3-5)
   - **Indirect Competitors:** Different product, same problem solved (2-3)
   - **Aspirational Competitors:** Market leaders (1-2)
3. For each of the top 3 competitors, use `webfetch` on their homepage to extract:
   - Headline and subheadline
   - Value proposition
   - Pricing (if public)
   - Target audience signals
   - Key differentiators
4. Plot competitors on a positioning map (Simplicity vs Power, Affordability vs Premium)
5. Build a feature comparison matrix
6. Analyze content and SEO gaps
7. Perform SWOT analysis for target and each competitor

### Analysis 4: Technical SEO

**Focus:** Technical SEO, site architecture, page speed

Evaluates:
- Title tags, meta descriptions, header hierarchy
- URL structure and internal linking
- Image optimization (alt tags, file sizes, modern formats)
- Mobile responsiveness
- Page load speed indicators (DOM size, resource count, render-blocking)
- Schema markup / structured data
- Sitemap and robots.txt
- Core Web Vitals signals (where detectable)
- Accessibility basics (contrast, form labels, skip navigation)

**Score:** SEO & Discoverability (0-100)

**Process:**
1. Use `webfetch` on the target URL and analyze:
   - Title tag quality and length
   - Meta description presence and quality
   - H1, H2, H3 hierarchy and usage
   - Image alt tags
   - Internal linking structure
   - Schema markup / JSON-LD
   - Mobile viewport meta tag
   - Canonical tags
   - Robots meta directives

2. Use `webfetch` on `/robots.txt` and `/sitemap.xml` (if accessible)

3. Score each dimension 0-10:
   - **On-Page SEO:** Title tags, meta descriptions, header tags, image optimization
   - **Technical Foundation:** URL structure, canonical tags, robots.txt, sitemap, schema markup
   - **Mobile & Performance:** Viewport, mobile-friendliness signals, load speed indicators
   - **Content Structure:** Internal linking, content hierarchy, topic clusters
   - **Accessibility:** Alt tags, form labels, contrast, navigation

4. Convert to 0-100 SEO & Discoverability score.

### Analysis 5: Strategy

**Focus:** Overall strategy, pricing, growth opportunities

Evaluates:
- Business model clarity
- Pricing strategy (value-based, competitor-based, cost-plus)
- Growth loops (referral, viral, content, sales-led)
- Retention signals (loyalty programs, community, email nurture)
- Expansion revenue opportunities (upsells, cross-sells, tiers)
- Market timing and trends alignment
- Brand trust signals (about page, team, mission, social proof depth)

**Scores:** Brand & Trust (0-100), Growth & Strategy (0-100)

**Process:**
1. Use `webfetch` to analyze the homepage, about page, and pricing page.
2. Score Brand & Trust 0-100 based on:
   - Design quality and professionalism
   - About page depth (team, mission, story)
   - Social proof depth (testimonials, case studies, client logos, reviews)
   - Trust signals (security, guarantees, certifications)
   - Brand consistency across pages
3. Score Growth & Strategy 0-100 based on:
   - Pricing strategy clarity and sophistication
   - Lead capture mechanisms
   - Growth loops (referral programs, viral features, content engine)
   - Retention strategy (community, email nurture, loyalty)
   - Expansion opportunities (upsells, cross-sells, new tiers)
   - Market positioning and trend alignment

---

## Phase 3: Synthesis (Aggregation and Scoring)

### 3.1 Scoring Methodology

Compute the composite Marketing Score using weighted averages:

```
Marketing Score = (
    Content_Score      * 0.25 +
    Conversion_Score   * 0.20 +
    SEO_Score          * 0.20 +
    Competitive_Score  * 0.15 +
    Brand_Score        * 0.10 +
    Growth_Score       * 0.10
)
```

**Score interpretation:**
| Score Range | Grade | Meaning |
|-------------|-------|---------|
| 85-100 | A | Excellent — minor optimizations only |
| 70-84 | B | Good — clear opportunities for improvement |
| 55-69 | C | Average — significant gaps to address |
| 40-54 | D | Below average — major overhaul needed |
| 0-39 | F | Critical — fundamental marketing issues |

### 3.2 Aggregate Recommendations

Collect all recommendations from analyses and classify them:

**Quick Wins** (implement in < 1 week, low effort, high impact):
- Copy changes to headlines and CTAs
- Adding missing meta descriptions
- Adding trust signals near CTAs
- Fixing broken links or images
- Adding urgency or social proof

**Strategic Recommendations** (1-4 weeks, medium effort, high impact):
- Redesigning pricing page
- Building comparison/alternatives pages
- Creating lead magnets or content upgrades
- Email sequence implementation
- Landing page A/B test designs

**Long-Term Initiatives** (1-3 months, high effort, transformative impact):
- Content marketing strategy overhaul
- SEO content gap campaign
- Funnel redesign
- Brand repositioning
- New growth channel development

### 3.3 Revenue Impact Estimates

For each recommendation, estimate the revenue impact:

```
Revenue Impact Formula:
  Current Monthly Traffic x Conversion Rate Improvement x Average Deal Value
  = Estimated Monthly Revenue Lift

Example:
  10,000 visitors x 0.5% conversion lift x $99 ARPU = $4,950/month
```

Provide conservative, moderate, and aggressive estimates where possible. Use these qualifiers:

| Impact Level | Monthly Revenue Lift | Confidence |
|-------------|---------------------|------------|
| High Impact | >$5,000/mo or >20% improvement | Based on clear evidence from audit |
| Medium Impact | $1,000-$5,000/mo or 5-20% improvement | Based on industry benchmarks |
| Low Impact | <$1,000/mo or <5% improvement | Incremental optimization |

### 3.4 Competitor Comparison Table

If competitive analysis identified competitors, include a comparison:

```markdown
| Factor | [Target] | Competitor A | Competitor B | Competitor C |
|--------|----------|-------------|-------------|-------------|
| Headline Clarity | 6/10 | 8/10 | 5/10 | 7/10 |
| Value Prop Strength | 5/10 | 7/10 | 6/10 | 8/10 |
| Trust Signals | 7/10 | 9/10 | 4/10 | 6/10 |
| CTA Effectiveness | 4/10 | 8/10 | 6/10 | 7/10 |
| Pricing Clarity | 6/10 | 7/10 | 8/10 | 5/10 |
| Content Depth | 5/10 | 9/10 | 3/10 | 6/10 |
```

---

## Output Format: MARKETING-AUDIT.md

Write the final report to `MARKETING-AUDIT.md` in the current directory with this structure:

```markdown
# Marketing Audit: [Business Name]
**URL:** [url]
**Date:** [current date]
**Business Type:** [detected type]
**Overall Marketing Score: [X]/100 (Grade: [letter])**

---

## Executive Summary

[3-5 paragraph summary for a non-technical stakeholder. Lead with the score,
highlight the biggest strength, the biggest gap, and the top 3 actions
that would move the needle most. Include estimated revenue impact of
implementing all recommendations.]

---

## Score Breakdown

| Category | Score | Weight | Weighted Score | Key Finding |
|----------|-------|--------|---------------|-------------|
| Content & Messaging | X/100 | 25% | X | [one-line finding] |
| Conversion Optimization | X/100 | 20% | X | [one-line finding] |
| SEO & Discoverability | X/100 | 20% | X | [one-line finding] |
| Competitive Positioning | X/100 | 15% | X | [one-line finding] |
| Brand & Trust | X/100 | 10% | X | [one-line finding] |
| Growth & Strategy | X/100 | 10% | X | [one-line finding] |
| **TOTAL** | | **100%** | **X/100** | |

---

## Quick Wins (This Week)

[Numbered list of 5-10 quick wins with specific implementation steps.
Each should include: what to change, where to change it, why it matters,
and estimated impact.]

## Strategic Recommendations (This Month)

[Numbered list of 3-7 strategic recommendations with rationale,
implementation steps, and expected outcomes.]

## Long-Term Initiatives (This Quarter)

[Numbered list of 2-5 long-term initiatives with business case,
resource requirements, and projected ROI.]

---

## Detailed Analysis by Category

### Content & Messaging Analysis
[Full findings from Analysis 1]

### Conversion Optimization Analysis
[Full findings from Analysis 2]

### SEO & Discoverability Analysis
[Full findings from Analysis 4]

### Competitive Positioning Analysis
[Full findings from Analysis 3]

### Brand & Trust Analysis
[Full findings from Analysis 5 — brand section]

### Growth & Strategy Analysis
[Full findings from Analysis 5 — growth section]

---

## Competitor Comparison

[Comparison table from Section 3.4]

---

## Revenue Impact Summary

| Recommendation | Est. Monthly Impact | Confidence | Timeline |
|---------------|-------------------|------------|----------|
| [recommendation 1] | $X,XXX | High/Med/Low | X weeks |
| [recommendation 2] | $X,XXX | High/Med/Low | X weeks |
| ... | | | |
| **Total Potential** | **$XX,XXX/mo** | | |

---

## Next Steps

1. [Most critical action item]
2. [Second priority]
3. [Third priority]

*Generated by AI Marketing Suite — `/market audit`*
```

---

## Terminal Output

In addition to the file, display a condensed summary in the terminal:

```
=== MARKETING AUDIT COMPLETE ===

Business: [name] ([type])
URL: [url]
Marketing Score: [X]/100 (Grade: [letter])

Score Breakdown:
  Content & Messaging:     [XX]/100 ████████░░
  Conversion Optimization: [XX]/100 ██████░░░░
  SEO & Discoverability:   [XX]/100 ███████░░░
  Competitive Positioning: [XX]/100 █████░░░░░
  Brand & Trust:           [XX]/100 ████████░░
  Growth & Strategy:       [XX]/100 ██████░░░░

Top 3 Quick Wins:
  1. [win]
  2. [win]
  3. [win]

Top 3 Strategic Moves:
  1. [move]
  2. [move]
  3. [move]

Estimated Revenue Impact: $X,XXX-$XX,XXX/month

Full report saved to: MARKETING-AUDIT.md
```

---

## Error Handling

- If the URL is unreachable, report the error and suggest checking the URL
- If an analysis fails, continue with remaining analyses and note the gap in the report
- If the site is behind authentication, note what was accessible and recommend manual review for gated content
- If the site has very little content (single page), adapt the analysis accordingly and note limited scope

## Cross-Skill Integration

- If `COMPETITOR-REPORT.md` exists in the current directory, incorporate its findings
- If `BRAND-VOICE.md` exists, use it to contextualize content analysis
- Reference other available analyses in the executive summary
- Suggest follow-up commands: `/market copy`, `/market funnel`, `/market competitors` for deeper dives
