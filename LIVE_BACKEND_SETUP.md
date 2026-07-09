# Live backend setup

Set these Netlify environment variables:

SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
APPROVAL_EMAIL=tende.amery@gmail.com
TRENDIES_ADMIN_EMAIL=tende.amery@gmail.com
RESEND_API_KEY=your_resend_key
EMAIL_FROM=Trendies Global <hello@trendiesglobal.com>
TRENDIES_FROM_EMAIL=Trendies Global <hello@trendiesglobal.com>
APPROVAL_SECRET=make_a_long_random_secret
EXPORT_SECRET=make_a_different_long_random_dashboard_token
TRENDIES_ADMIN_PASSWORD=make_a_long_private_dashboard_password
ADMIN_SECRET=make_a_long_private_admin_password
SITE_URL=https://trendiesglobal.com
WEEKLY_DIGEST_ENABLED=false

# Optional AI summaries for the private dashboard
OPENAI_API_KEY=your_openai_api_key
OPENAI_CATEGORISATION_MODEL=gpt-5.4-mini
AI_TIMEOUT_MS=5000

# Optional after Google Sheets is set up
SEND_INTEREST_EMAILS=false

Run `SUPABASE_SETUP.sql` in Supabase SQL Editor after deploying this code.

Country flag wall submissions go live immediately.
Interest forms save to Supabase, dedupe by lower-case email, get sorted into readable categories, sync to Resend contacts, send a welcome email once, and email Tende unless `SEND_INTEREST_EMAILS=false` is set.
Wall notes save as pending and can be approved manually in Supabase for now.
Partner enquiries save separately in `trendies_partner_enquiries` and can email Tende unless `SEND_PARTNER_EMAILS=false` is set.

Important Resend setup:
- Verify `trendiesglobal.com` in Resend.
- Use a verified sender such as `Trendies Global <hello@trendiesglobal.com>`.
- Keep `RESEND_API_KEY` only in Netlify environment variables, never in browser code.
- `RESEND_AUDIENCE_ID` is optional/legacy. Resend's current API uses Contacts/Broadcasts; this site adds opted-in users to Resend Contacts so you can send Broadcasts manually.
- To mass email everyone, use the Resend Broadcast dashboard. Only email people who opted into updates and have not unsubscribed.

New private pages:
- `/DATA_DASHBOARD.html` is the private CRM dashboard. Use `EXPORT_SECRET`.
- `/admin/signups` opens the private signup dashboard. Use `EXPORT_SECRET` or `TRENDIES_ADMIN_PASSWORD`.
- `/admin/emails` is the private broadcast page. Use `ADMIN_SECRET` or `EXPORT_SECRET`.
- `/preferences?token=...` lets users change email categories.
- `/unsubscribe?token=...` unsubscribes users.
- `/welcome?token=...` is the post-signup success page.

The form always creates the core launch categories with built-in rules:

- Region
- Respondent type
- Partnership type
- Intent strength
- Activity tags
- Safety tags
- Country/city

If `OPENAI_API_KEY` is added, the function also asks OpenAI for an owner-friendly `ai_summary`, `ai_priority` and `ai_tags`. If OpenAI is missing, slow or unavailable, the form still works and uses the built-in categories.

For high traffic, use `AUTOMATIC_DATA_SPREADSHEET_SETUP.md` to create a Google Sheet that refreshes from `/api/export-interests?token=...` every 5 minutes. It creates raw data, a clean owner-friendly dataset, breakdowns and dashboard pie charts. This keeps email as optional backup rather than the main data system.

Test after deploy:
1. Submit the interest form with a new email and confirm the welcome email arrives.
2. Submit again with the same email and confirm the dashboard updates the same person instead of creating a duplicate.
3. Open `/welcome` from the redirect and copy the referral link.
4. Open `/preferences?token=...`, save preferences, then `/unsubscribe?token=...`.
5. Submit the partner form and confirm it appears in the dashboard.
6. Open `/admin/emails`, load audience, send a test email to yourself, and only use real send after typing `SEND`.
7. Open `/DATA_DASHBOARD.html`, enter `EXPORT_SECRET`, confirm totals, charts, filters, CSV and welcome-resend buttons work.


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
- `TRENDIES_ADMIN_PASSWORD` choose a long private password for `/admin/signups`

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
