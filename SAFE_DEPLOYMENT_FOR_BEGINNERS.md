# Safe Deployment For Beginners

This file explains what you can do without taking the website offline.

## Key Rule

Your live website does not need to go offline for normal updates.

Netlify deploys are atomic: Netlify prepares a complete new version first, then switches traffic to it only when it is ready. The old live site keeps running while the new deploy uploads/builds.

## Safest Thing To Do First

Set up the Google Sheet using:

```txt
AUTOMATIC_DATA_SPREADSHEET_SETUP.md
google-sheets-sync.gs
```

This does not deploy anything. It does not change the website. It only reads the existing private export endpoint:

```txt
https://trendiesglobal.com/api/export-interests?token=YOUR_EXPORT_SECRET
```

## When You Do Not Need To Redeploy

You do not need to redeploy to:

- set up the Google Sheet
- approve wall notes in Supabase
- read the private dashboard
- download CSV data
- create Gmail filters
- view signups in Supabase

## When You Do Need To Redeploy

You need to redeploy only when you change website code or settings inside the code package.

Examples:

- changing the homepage design
- changing JavaScript/CSS
- changing Netlify Functions
- publishing the new favicon/search files that replace the old Wix icon over time
- changing `SEND_INTEREST_EMAILS=false` or optional AI settings in Netlify

## If Your Site Is Deployed From GitHub

Use this path:

1. Upload or commit changed files to GitHub.
2. Netlify automatically creates a new deploy.
3. Wait for Netlify to say `Published`.
4. Test the live site.

Safer GitHub workflow later:

1. Create a branch.
2. Make changes there.
3. Open a pull request.
4. Netlify creates a Deploy Preview.
5. Test the preview.
6. Merge only when correct.

## If Your Site Is Deployed From ZIP

Use this path:

1. Go to Netlify.
2. Open the same live site.
3. Go to `Deploys`.
4. Drag in the updated ZIP.
5. Wait for it to finish.

Do not create a brand new Netlify site unless you intentionally want to move the domain.

## Safe Rollback

If a new deploy looks wrong:

1. Go to Netlify.
2. Open your site.
3. Click `Deploys`.
4. Pick the previous good deploy.
5. Choose `Publish deploy`.

That restores the previous version.

## What To Check After Any Redeploy

Run this live checklist:

1. Homepage opens.
2. Interest form submits.
3. Supabase receives the signup.
4. Dashboard opens with `EXPORT_SECRET`.
5. Flag wall still submits.
6. Wall note saves as pending.
7. Mobile page still reads correctly.

## Current Recommendation

Do not redeploy just to create the Google Sheet.

Set up the Google Sheet first. After it is working, deploy the V83 package when you are ready to publish the favicon/search improvements and the lower-cost optional AI model default.
