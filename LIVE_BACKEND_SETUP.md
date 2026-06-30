# Live backend setup

Set these Netlify environment variables:

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
APPROVAL_EMAIL=tende.amery@gmail.com
RESEND_API_KEY=your_resend_key
EMAIL_FROM=Trendies <your_verified_sender@yourdomain.com>
APPROVAL_SECRET=make_a_long_random_secret
EXPORT_SECRET=make_a_different_long_random_dashboard_token

# Optional AI summaries for the private dashboard
OPENAI_API_KEY=your_openai_api_key
OPENAI_CATEGORISATION_MODEL=gpt-5.5
AI_TIMEOUT_MS=5000

Run SUPABASE_SETUP.sql in Supabase SQL Editor.

Country flag wall submissions go live immediately.
Interest forms save to Supabase, get sorted into readable categories, and email Tende.
Wall notes save as pending and can be approved manually in Supabase for now.

The form always creates the core launch categories with built-in rules:

- Region
- Respondent type
- Partnership type
- Intent strength
- Activity tags
- Safety tags
- Country/city

If `OPENAI_API_KEY` is added, the function also asks OpenAI for an owner-friendly `ai_summary`, `ai_priority` and `ai_tags`. If OpenAI is missing, slow or unavailable, the form still works and uses the built-in categories.


# v62 live categorised data dashboard

This version sends every interest response to:
1. Supabase table: `trendies_interest_responses`
2. Email: `tende.amery@gmail.com` through Resend
3. Private live dashboard: `/DATA_DASHBOARD.html`

Required environment variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM` must be a verified Resend sender
- `APPROVAL_EMAIL=tende.amery@gmail.com`
- `APPROVAL_SECRET` choose a long private random value for request hashing
- `EXPORT_SECRET` choose a long private password/token

## Domain setup

In Netlify, add these custom domains:

- `trendiesglobal.com` as the primary domain
- `www.trendiesglobal.com` as the secondary domain

Netlify will show the DNS records to add wherever you bought the domain. After DNS is connected, Netlify should issue HTTPS automatically. The site is already configured so `www.trendiesglobal.com` redirects to `trendiesglobal.com`.

## Private dashboard

Access the live dashboard after deploy:
`https://trendiesglobal.com/DATA_DASHBOARD.html`

Enter your `EXPORT_SECRET` as the dashboard token.
The dashboard auto-refreshes every 30 seconds and has a CSV download button.

After deploy, submit one test interest form, one country flag wall submission and one wall note. Confirm the interest appears in Supabase, the email reaches `tende.amery@gmail.com`, the dashboard totals update, and CSV export downloads from the dashboard.

Categories created automatically:
- Region
- Respondent type
- Partnership type
- Intent strength
- Activity tags
- Safety tags
- Country
- Optional AI summary, priority and tags when `OPENAI_API_KEY` is set

## Owner editor

After the site is connected to GitHub in Netlify, enable Netlify Identity and Git Gateway. Then open:

`https://trendiesglobal.com/admin/`

Use the editor to update homepage copy, change photos and add chapter notes without editing code. Full instructions are in `OWNER_EDITING_GUIDE.md`.


## Visual launch update

The homepage uses a live global flag wall instead of inaccurate map pins. It still saves country submissions through the same Netlify Function and Supabase table.

## v63 fetch fix

### Why the interest form said “Failed to fetch”
That message usually means the browser could not reach the backend at all. The common causes are:
- testing the site by opening `index.html` as a local `file://` file;
- the site is deployed as static files but Netlify Functions are not deployed;
- `/api/*` is not being redirected to `/.netlify/functions/*`;
- required backend environment variables are missing in Netlify.

This version adds:
- a `_redirects` file: `/api/*  /.netlify/functions/:splat  200`;
- keeps the `netlify.toml` redirect;
- frontend fallback from `/api/function-name` to `/.netlify/functions/function-name`;
- clearer error messages if someone tests from a local file preview.
