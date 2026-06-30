# AGENTS.md — Trendies Global launch instructions

## Project goal
Launch Trendies Global today or tomorrow latest.

This is a static Netlify website with Netlify Functions and Supabase.
Do not redesign the site unless a bug blocks launch. The current layout is approved.

## Brand / content rules
- Keep the current v61 layout.
- Keep “coming-of-age summer”, “Chapter One”, and “Trendies Global”.
- Keep the current hero photo without naming the venue as a collaboration.
- Keep the country flag wall, wall, partnership section and live data dashboard.
- Avoid the banned youth-leadership wording.
- Do not overpromise confirmed events, dates, venues or cities.
- Use safe/public/daylight language for plans.

## Required production behavior
- Interest form submissions must save to Supabase.
- Interest form submissions must email: tende.amery@gmail.com
- Interest responses must be categorised into:
  - region
  - respondent_type
  - partnership_type
  - intent_strength
  - activity_tags
  - safety_tags
  - country/city
- DATA_DASHBOARD.html must load live data using /api/dashboard-data?token=...
- Dashboard must be noindex.
- CSV export must work using /api/export-interests?token=...
- Country flag pins must save immediately and update counts.
- Wall notes must save as pending for review.

## Environment variables needed in Netlify
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
EMAIL_FROM
APPROVAL_EMAIL=tende.amery@gmail.com
APPROVAL_SECRET
EXPORT_SECRET

## Checks to run
Run these before saying the site is launch-ready:

```bash
npm test
```

Also manually inspect:
- index.html
- /DATA_DASHBOARD.html
- /robots.txt
- /sitemap.xml

## Success criteria
- `npm test` passes.
- No JS syntax errors.
- Netlify Functions compile.
- Dashboard is private/noindex.
- Launch docs clearly explain deployment.
