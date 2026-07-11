# Trendies Global: Read Me First

This is the updated clean folder to upload:

`TRENDIES_GLOBAL_V85_SIGNUP_EMAIL_ADMIN_READY`

For Netlify drag-and-drop, use:

`TRENDIES_GLOBAL_V85_SIGNUP_EMAIL_ADMIN_READY.zip`

## What is inside

- The Trendies Global homepage
- Live join form
- Live global flag wall
- Live wall note form
- Private owner dashboard
- Netlify Functions
- Supabase setup SQL
- Google search files
- AI-readable summary files
- Owner editing setup
- Google Sheets auto-sync setup
- Google Search setup guide
- Beginner safe deployment guide

## What changed most recently

- Added Tende's polished "A coming of age" note as a visual scrapbook section.
- Kept the page from becoming too text-heavy by putting the longer note inside "Read Tende's note".
- Removed the glitchy pencil cursor.
- Removed the unreliable YouTube embed.
- Replaced inaccurate map pins with a live global flag wall.
- Removed visible venue/location wording from the hero image.
- Fixed the three interest-form side photos so Netlify does not swap or over-crop them.
- Added optional AI-assisted categorisation fields for the private dashboard and CSV export.
- Added a proper Trendies favicon and web manifest to replace the old Wix icon after Google recrawls.
- Added a Google Sheets automation that creates a clean dataset, breakdown tabs and dashboard pie charts.
- Added batched CSV export support so the spreadsheet can pull growing signup data safely.
- Added automatic welcome emails, Resend contact sync, preferences, unsubscribe links and a private signups dashboard route.

## Netlify environment variables

Add these in Netlify:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `TRENDIES_FROM_EMAIL` = `Trendies Global <hello@trendiesglobal.com>`
- `APPROVAL_EMAIL` = `tende.amery@gmail.com`
- `TRENDIES_ADMIN_EMAIL` = `tende.amery@gmail.com`
- `APPROVAL_SECRET`
- `EXPORT_SECRET`
- `TRENDIES_ADMIN_PASSWORD`
- `ADMIN_SECRET`
- `SITE_URL` = `https://trendiesglobal.com`

Use long private random values for `APPROVAL_SECRET`, `EXPORT_SECRET`, `TRENDIES_ADMIN_PASSWORD` and `ADMIN_SECRET`.

You make the admin password yourself. It is not a GitHub password, Netlify password or Resend password. Put the same long private password in `TRENDIES_ADMIN_PASSWORD` and `ADMIN_SECRET` if you want one owner password for the private dashboard and bulk email page.

`RESEND_AUDIENCE_ID` is optional/legacy. Resend's current API uses global Contacts, Segments, Topics and Broadcasts; Audiences are marked deprecated in the Resend docs. This site syncs opted-in users to Resend Contacts so you can send Broadcasts from Resend.

Optional if you want AI-written summaries/priorities in the dashboard:

- `OPENAI_API_KEY`
- `OPENAI_CATEGORISATION_MODEL` = `gpt-5.6-luna`
- `AI_TIMEOUT_MS` = `5000`
- `SEND_INTEREST_EMAILS=false` only if you want to stop routine signup emails after setting up the spreadsheet

Without the optional AI variables, the site still sorts signups automatically using the built-in launch categories.

Read `OWNER_ADMIN_EMAIL_AI_GUIDE.md` for the beginner steps to create the admin password, add the OpenAI key, use AI categorisation and send one bulk email to everyone who opted in.

## Launch steps

1. Upload `TRENDIES_GLOBAL_V85_SIGNUP_EMAIL_ADMIN_READY.zip` to Netlify.
2. Add the environment variables above.
3. Run `SUPABASE_SETUP.sql` in Supabase.
4. Connect `trendiesglobal.com` in Netlify as the primary domain.
5. Add `www.trendiesglobal.com` as the secondary domain.
6. Wait for HTTPS to activate.
7. Test the join form, flag wall form and wall note form on the live site.
8. Open `https://trendiesglobal.com/admin/signups` or `https://trendiesglobal.com/DATA_DASHBOARD.html` and enter your `EXPORT_SECRET` or `TRENDIES_ADMIN_PASSWORD`.
9. Submit `https://trendiesglobal.com/sitemap.xml` in Google Search Console.
10. Use `GOOGLE_SEARCH_SETUP.md` to request homepage indexing and fix the old search icon over time.

## Easy editing later

Drag-and-drop deploy works for launch. To use the no-code `/admin/` editor later, connect the site to a GitHub repo in Netlify, then enable Netlify Identity and Git Gateway. This is still possible on Netlify Free.

## Automatic data spreadsheet

Use `AUTOMATIC_DATA_SPREADSHEET_SETUP.md` and `google-sheets-sync.gs` to create a Google Sheet that pulls live categorised signups every 5 minutes and creates a clean dataset, breakdowns and dashboard charts.

Read `SAFE_DEPLOYMENT_FOR_BEGINNERS.md` before redeploying anything. The spreadsheet setup does not require redeploying the live website.
