# Launch today checklist

- Deploy ZIP/folder to Netlify
- Connect custom domain `trendiesglobal.com`
- Add `www.trendiesglobal.com` and keep `trendiesglobal.com` as primary
- Wait for Netlify HTTPS to become active
- Run SUPABASE_SETUP.sql
- Add Netlify environment variables:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `EMAIL_FROM=Trendies Global <hello@trendiesglobal.com>`
  - `TRENDIES_FROM_EMAIL=Trendies Global <hello@trendiesglobal.com>`
  - `APPROVAL_EMAIL=tende.amery@gmail.com`
  - `TRENDIES_ADMIN_EMAIL=tende.amery@gmail.com`
  - `APPROVAL_SECRET`
  - `EXPORT_SECRET`
  - `TRENDIES_ADMIN_PASSWORD`
  - `ADMIN_SECRET`
  - `SITE_URL=https://trendiesglobal.com`
  - `WEEKLY_DIGEST_ENABLED=false`
- Optional for AI summaries in the private dashboard:
  - `OPENAI_API_KEY`
  - `OPENAI_CATEGORISATION_MODEL=gpt-5.4-mini`
  - `AI_TIMEOUT_MS=5000`
- In Resend:
  - Verify `trendiesglobal.com`
  - Confirm `hello@trendiesglobal.com` can send
  - Use Resend Contacts/Broadcasts for mass email; `RESEND_AUDIENCE_ID` is optional/legacy
- Test:
  - Join form
  - Duplicate join form with the same email
  - Welcome email and `/welcome` page
  - Preferences page
  - Unsubscribe page
  - Country flag wall
  - Wall note form
  - Partner enquiry form
  - `/admin/signups` dashboard route
  - `/DATA_DASHBOARD.html` CRM filters, CSV and resend-welcome button
  - `/admin/emails` audience load and test send
  - Mobile layout
  - Day/night toggle
- Submit `https://trendiesglobal.com/sitemap.xml` to Google Search Console
- Use URL Inspection in Google Search Console for `https://trendiesglobal.com/` and request indexing
- Use `AUTOMATIC_DATA_SPREADSHEET_SETUP.md` to create the live Google Sheet
- Use `GOOGLE_SEARCH_SETUP.md` to confirm favicon, sitemap and indexing steps

## v83 data + SEO update
- Added `favicon.svg` and `site.webmanifest` so Google can replace the old Wix icon after recrawling.
- Updated the Google Sheets automation to create `Interest Forms`, `Clean Dataset`, `Breakdowns` and `Dashboard` tabs.
- Added dashboard pie charts for signup type, region, intent and activity interests.
- Added batched CSV export support for larger signup volume.
- Changed the default optional OpenAI categorisation model to `gpt-5.4-mini` for lower cost and latency.

## v84 email CRM update
- Interest signups now dedupe by lower-case email.
- Signups store consent, 18+ confirmation, referral code, email preferences and unsubscribe token.
- Opted-in users receive one automatic welcome email.
- Resend contacts are created or updated server-side only.
- `/welcome`, `/preferences` and `/unsubscribe` are noindex and token-based.
- `/admin/emails` lets Tende load eligible recipients, send a test email, and broadcast only after typing `SEND`.
- `/DATA_DASHBOARD.html` now works as a private CRM with city/country charts, helper filters, partner enquiries and welcome-resend actions.
- The homepage now has aggregate Chapter One city cards, a partner form and clearer safety/trust language.

## Extra launch copy now included
- Coming-of-age concept explanation
- Partnership enquiry CTA
- Optional helper/collaborator field in join form


## v60 content added
- 200k+ video traction in under 24 hours
- In-between/hometown origin story
- Populated starter wall messages


## v61 launch data checks
- Confirm every Netlify environment variable above is set
- Open `/DATA_DASHBOARD.html`
- Enter the token and confirm live dashboard loads
- Submit a test interest form
- Confirm:
  - the dashboard updates
  - the CSV download works
  - email arrives at tende.amery@gmail.com

## Owner editor check
- If you want no-code updates, connect the site to GitHub in Netlify
- Enable Netlify Identity
- Enable Git Gateway
- Invite your email
- Open `/admin/`
- Confirm you can see Homepage and Blog posts


## Visual launch update

- The homepage now clearly explains Trendies as a community for people who want their coming-of-age summer but do not want to do it alone.
- The inaccurate map pins were replaced with a live global flag wall.
- The custom pencil cursor and YouTube embed were removed for launch stability.
- The founder manifesto is included as a short "Dear Trendies" section.
- Tende's "A coming of age" note is included in a compact foldout section.

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


## v64 update — photo refresh + anti-overlap
- Rebalanced the page so text has more breathing room and does not collide with adjacent content.
- Reduced the maximum size of the largest headings at desktop and mobile breakpoints.
- Replaced the old overlapping photo stack with a cleaner collage grid.
- Added a compact visual scrapbook strip using more of the previously supplied photos.
- Reduced repeated use of the same images across hero, join, notes, story and blog cards.
- Reintroduced underused images: blue portrait, Paris night, waterfall and Rio Christ the Redeemer.


## v65 update — prompt cards no-overlap
- Fixed the prompt cards overlapping the text/section behind them.
- Removed the downward translate that was causing visual collision.
- Replaced it with safe margin-based staggering on desktop.
- On mobile, prompt cards now stack cleanly with no overlap.


## v66 update — all photos visible
- Added a full photo album section with every supplied asset currently in `/assets`.
- Photo count in the album: 16.
- The images were not deleted in v64/v65, but this makes them explicitly visible on the page.
- Added a Photos nav link.
- Kept anti-overlap fixes from v65.


## v67 update — Codex scrapbook + all photos + launch backend
- Restored the Codex scrapbook aesthetic the user was working on.
- Kept the accurate global flag wall instead of inaccurate map pins.
- Removed/disabled the glitchy pencil cursor.
- Made every supplied image visible in a full scrapbook album.
- Copied all uploaded photos into `/assets`, including the newest chapter lake, marina, lookout, fire, cultural friends, beach, bike, city, Paris, Rio and waterfall images.
- Kept Supabase, Resend email to `tende.amery@gmail.com`, dashboard, CSV export and Netlify Functions intact.
- Protected prompt cards and photo cards from overlapping text.


## v68 update — clean scrapbook copy and manifesto
- Removed internal/Codex wording from the visible website.
- Removed random scrapbook photo captions/labels.
- Fixed the intro friends image so it does not crop friends out.
- Reworked the manifesto section so the text has breathing room and reads like a letter.
- Kept all photos, backend, dashboard, forms and Netlify setup intact.


## v70 update — purposeful scrapbook, no random photo wall
- Removed the random full photo wall.
- Photos are now chosen for a clear purpose: hero, join, coming-age note, chapter reel and one compact chapter-scenes strip.
- Fixed the cultural outfit friends image in the intro so the full group is visible using `object-fit: contain`.
- Kept scrapbook tape/movement aesthetic without turning the site into a random photo book.
- Kept backend, form, dashboard, Supabase, Resend and Netlify Functions intact.


## v71 update — clearer interest list and safer hero crop
- Fixed the main hero image crop by using `object-fit: contain` so Tende's face is not cut out.
- Added a short, clear “What this is” section explaining the platform.
- Reframed the join flow as an interest list.
- Made the join CTA clearer: “Join the interest list.”
- Kept the purposeful scrapbook layout and backend intact.

## v72 emergency hero fix
- Removed the badly cropped green-top/city photo from the intro hero.
- Main intro image now uses a landscape-safe chapter photo.
- Cultural outfit group photo is shown with `object-fit: contain` so the friends are not cut out.
- Kept the clearer interest-list copy and backend intact.

## v73 high-quality photo pass
- Re-selected visible photos for stronger quality and clearer section purpose.
- Added progressive optimized image variants in `/assets/optimized` while preserving original uploads.
- Avoided using low-quality photos as large hero moments.
- Kept group/cultural outfit image contained so people are not cropped out.

## v74 Linktree
- Added Tende’s Linktree: https://linktr.ee/tendeamery
- Added it to the header, hero actions, partner section/footer, and structured data.

## v76 final 1am launch fix
- Removed blurry mountain photo from the hero.
- Rebuilt the hero with high-quality, purposeful photos.
- Added clear short explanation that this is an interest list for a coming-of-age community.
- Kept forms, dashboard, Netlify Functions, Supabase and email intact.

## v81 v77 design with scrapbook handle removed
- Restored the v77 single-hero / standout-card design.
- Removed only mentions/links for `tende.scrapbook`.
- Kept the Build with us section and original v77 structure intact.
