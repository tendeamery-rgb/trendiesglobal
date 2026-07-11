# Automatic Trendies Data Spreadsheet

This creates a live Google Sheet for Trendies interest-form data without touching the live website.

Important: this setup does **not** redeploy Netlify. It only reads the private export link that already exists on your site:

```txt
https://trendiesglobal.com/api/export-interests?token=YOUR_EXPORT_SECRET
```

## What You Will Have

- Google Drive folder: `Trendies Global Data`
- Google Sheet: `Trendies Interest Forms Live`
- Tab 1: `Interest Forms` for the raw website export
- Tab 2: `Clean Dataset` for owner-friendly readable rows
- Tab 3: `Breakdowns` for category counts
- Tab 4: `Dashboard` for live totals and pie charts
- Automatic refresh every 5 minutes
- Batched export pulls, so the Sheet can keep collecting data as signups grow

The clean dataset uses these columns:

```txt
date
customer name
email
phone
service requested
enquiry category
budget
urgency
location
notes
region
respondent type
partnership type
intent strength
activity tags
safety tags
wants updates
AI priority
AI summary
AI tags
```

Phone and budget are left blank/default because the current live form does not ask for them yet.

## Before You Start

You need your private Netlify dashboard token:

```txt
EXPORT_SECRET
```

This is the same private token used for:

```txt
https://trendiesglobal.com/DATA_DASHBOARD.html
```

Do not share the Google Sheet publicly. The Apps Script contains this private token.

## Step 1: Create A Google Drive Folder

1. Open Google Drive.
2. Click `New`.
3. Click `New folder`.
4. Name it:

```txt
Trendies Global Data
```

## Step 2: Create The Google Sheet

1. Open the `Trendies Global Data` folder.
2. Click `New`.
3. Click `Google Sheets`.
4. Rename the Sheet:

```txt
Trendies Interest Forms Live
```

## Step 3: Open Apps Script

Inside the Google Sheet:

1. Click `Extensions`.
2. Click `Apps Script`.
3. Delete any starter code.
4. Open the website file called:

```txt
google-sheets-sync.gs
```

5. Copy all of that file.
6. Paste it into Apps Script.

## Step 4: Paste Your EXPORT_SECRET

Find this line near the top:

```js
const EXPORT_SECRET = "PASTE_YOUR_EXPORT_SECRET_HERE";
```

Replace only the inside text with your real token:

```js
const EXPORT_SECRET = "your-real-private-export-secret";
```

Keep the quotation marks.

## Step 5: Save The Script

Click the save icon or press:

```txt
Command + S
```

## Step 6: Run The Setup

In Apps Script:

1. At the top, find the function dropdown.
2. Select:

```txt
setupTrendiesAutoSync
```

3. Click `Run`.
4. Google will ask for permissions.
5. Choose your Google account.
6. Click through the warnings and allow the script.

The warning appears because this is your own private script, not a published Google app.

## Step 7: Check The Sheet

Return to the Google Sheet.

You should see:

```txt
Interest Forms
Clean Dataset
Breakdowns
Dashboard
```

The `Dashboard` tab should show totals and pie charts. The Sheet will refresh automatically every 5 minutes.

The script pulls the export in batches of 5,000 rows, up to 100,000 rows per sync. That is enough for launch traffic while keeping the Sheet readable.

After refreshing the Sheet page, you should also see a top menu called:

```txt
Trendies Sync
```

Use:

```txt
Trendies Sync > Sync now
```

if you want to manually pull the latest responses.

## AI Categorisation

The website already sorts every signup using built-in rules:

- region
- respondent type
- partnership type
- intent strength
- activity tags
- safety tags
- country/city

Optional AI summaries are added only if this Netlify environment variable exists:

```txt
OPENAI_API_KEY
```

Recommended optional AI settings:

```txt
OPENAI_CATEGORISATION_MODEL=gpt-5.6-luna
AI_TIMEOUT_MS=5000
```

If OpenAI is missing, slow or unavailable, the form still submits and the built-in categories still save.

## Email Inbox Option

Keep the Gmail filters active for now. They move routine signup emails out of the main inbox while preserving an email backup.

After the Google Sheet has been working for at least a day, you can reduce signup email volume by adding this Netlify environment variable and redeploying:

```txt
SEND_INTEREST_EMAILS=false
```

That stops routine interest signup emails only. Signups will still save to Supabase, the private dashboard, CSV export and Google Sheets. Wall note review emails can continue separately.

## If It Does Not Work

Check these first:

1. The `EXPORT_SECRET` in Apps Script exactly matches Netlify.
2. The dashboard works at `https://trendiesglobal.com/DATA_DASHBOARD.html`.
3. The script still says:

```js
const TRENDIES_SITE_URL = "https://trendiesglobal.com";
```

4. In Apps Script, run `syncTrendiesInterests` manually and read the error message if Google shows one.
