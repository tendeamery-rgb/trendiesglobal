# Trendies Global Launch-Ready Website

This is the clean folder for the Trendies Global launch.

If you are uploading to Netlify, use the ZIP named:

`TRENDIES_GLOBAL_V83_DATA_SEO_GOOGLE_READY.zip`

## What is included

- Visual scrapbook-style homepage
- Clear coming-of-age community message
- Join form
- Live global flag wall
- Wall note form
- "Dear Trendies" manifesto
- "A coming of age" founder note
- Private live data dashboard
- Netlify Functions
- Supabase SQL setup
- Google search files
- AI-readable summary files
- Owner editing guide
- Google Sheets auto-sync script
- Google Search setup guide
- Resend welcome emails, preferences, unsubscribe and private broadcast tools

## Launch today

1. Upload the ZIP to Netlify.
2. Connect `trendiesglobal.com`.
3. Run `SUPABASE_SETUP.sql` in Supabase.
4. Add the Netlify environment variables from `READ_ME_FIRST.md`.
5. Test the join form, flag wall form and wall note form on the live site.
6. Open `/DATA_DASHBOARD.html` with your `EXPORT_SECRET`.
7. Follow `AUTOMATIC_DATA_SPREADSHEET_SETUP.md` to create the live Google Sheet.
8. Submit `https://trendiesglobal.com/sitemap.xml` to Google Search Console.

## Latest changes

- Added Tende's polished "A coming of age" note.
- Kept the longer note inside a "Read Tende's note" foldout.
- Removed the glitchy pencil cursor.
- Removed the unreliable YouTube embed.
- Replaced inaccurate map pins with a live global flag wall.
- Removed visible venue/location wording from the hero image.
- Kept dashboard/admin/private pages noindex while keeping the homepage searchable.
- Fixed the three interest-form side photos so Netlify does not swap or over-crop them.
- Added optional AI summaries/priorities for the private dashboard when `OPENAI_API_KEY` is set.
- Added a favicon and web manifest so Google can replace the old Wix icon after recrawling.
- Rebuilt the Google Sheets script so it creates a clean dataset, breakdowns and dashboard charts.
- Added batched CSV export support for the Google Sheet so launch data can keep growing.
- Added a private CRM dashboard, automatic welcome email, referral links, preference/unsubscribe pages, partner enquiry form and admin broadcast page.


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
