# Trendies Global: Read Me First

This is the final clean folder to upload:

`TRENDIES_GLOBAL_FINAL_NETLIFY_FREE_CROP_CHECKED`

For Netlify drag-and-drop, use:

`TRENDIES_GLOBAL_FINAL_NETLIFY_FREE_CROP_CHECKED.zip`

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

## What changed most recently

- Added Tende's polished "A coming of age" note as a visual scrapbook section.
- Kept the page from becoming too text-heavy by putting the longer note inside "Read Tende's note".
- Removed the glitchy pencil cursor.
- Removed the unreliable YouTube embed.
- Replaced inaccurate map pins with a live global flag wall.
- Removed visible venue/location wording from the hero image.
- Fixed the three interest-form side photos so Netlify does not swap or over-crop them.
- Added optional AI-assisted categorisation fields for the private dashboard and CSV export.

## Netlify environment variables

Add these in Netlify:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `APPROVAL_EMAIL` = `tende.amery@gmail.com`
- `APPROVAL_SECRET`
- `EXPORT_SECRET`

Use long private random values for `APPROVAL_SECRET` and `EXPORT_SECRET`.

Optional if you want AI-written summaries/priorities in the dashboard:

- `OPENAI_API_KEY`
- `OPENAI_CATEGORISATION_MODEL` = `gpt-5.5` unless you choose a different OpenAI model
- `AI_TIMEOUT_MS` = `5000`

Without the optional AI variables, the site still sorts signups automatically using the built-in launch categories.

## Launch steps

1. Upload `TRENDIES_GLOBAL_FINAL_NETLIFY_FREE_CROP_CHECKED.zip` to Netlify.
2. Add the environment variables above.
3. Run `SUPABASE_SETUP.sql` in Supabase.
4. Connect `trendiesglobal.com` in Netlify as the primary domain.
5. Add `www.trendiesglobal.com` as the secondary domain.
6. Wait for HTTPS to activate.
7. Test the join form, flag wall form and wall note form on the live site.
8. Open `https://trendiesglobal.com/DATA_DASHBOARD.html` and enter your `EXPORT_SECRET`.
9. Submit `https://trendiesglobal.com/sitemap.xml` in Google Search Console.

## Easy editing later

Drag-and-drop deploy works for launch. To use the no-code `/admin/` editor later, connect the site to a GitHub repo in Netlify, then enable Netlify Identity and Git Gateway. This is still possible on Netlify Free.
