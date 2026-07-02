# Google Search Setup

This folder includes the files Google needs to understand the Trendies Global site:

- `robots.txt`
- `sitemap.xml`
- `favicon.svg`
- `site.webmanifest`
- homepage title and description
- canonical URL for `https://trendiesglobal.com/`
- noindex tags for dashboard/admin/private pages
- AI-readable summaries: `llms.txt` and `ai.txt`

## Fix The Wix Icon In Google

The old Wix icon can remain in Google Search for a while because Google has to recrawl the site and favicon.

This package adds:

```html
<link href="/favicon.svg" rel="icon" sizes="any" type="image/svg+xml"/>
<link href="/site.webmanifest" rel="manifest"/>
```

After deploying this package, do this:

1. Open Google Search Console.
2. Add or select the property for:

```txt
https://trendiesglobal.com/
```

3. Go to `Sitemaps`.
4. Submit:

```txt
https://trendiesglobal.com/sitemap.xml
```

5. Use `URL Inspection`.
6. Inspect:

```txt
https://trendiesglobal.com/
```

7. Click `Request indexing`.

Google can take days or weeks to update a favicon in search results, even after the site is fixed.

Official Google favicon guidance:

```txt
https://developers.google.com/search/docs/appearance/favicon-in-search
```

## Domain Setup In Netlify

In Netlify, the live site should have:

```txt
trendiesglobal.com
```

as the primary domain.

Add this as a secondary domain:

```txt
www.trendiesglobal.com
```

This package already redirects `www.trendiesglobal.com` to `trendiesglobal.com`.

## What Should Be Searchable

Google should index:

- homepage
- public website content
- `sitemap.xml`
- `llms.txt`
- `ai.txt`

Google should **not** index:

- `DATA_DASHBOARD.html`
- `/admin/`
- Netlify Functions
- private dashboard/export URLs

Those private pages are protected with `noindex` and `robots.txt`.

## Quick Search Checks

After Google has had time to recrawl, search:

```txt
site:trendiesglobal.com
```

Then search:

```txt
Trendies Global coming-of-age summer
```

Do not expect instant results on launch day. Search visibility depends on crawling, indexing, domain history, external links and time.
