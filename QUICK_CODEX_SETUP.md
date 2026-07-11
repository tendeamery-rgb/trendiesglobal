# Quick Codex setup

1. Unzip this project.
2. Put it in a GitHub repo.
3. Open the repo in Codex.
4. Paste the prompt from `CODEX_PROMPT.md`.
5. Let Codex run `npm test`.
6. Deploy to Netlify.
7. Add these Netlify env vars:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
EMAIL_FROM
APPROVAL_EMAIL=tende.amery@gmail.com
APPROVAL_SECRET
EXPORT_SECRET

Optional after launch:

OPENAI_API_KEY
OPENAI_CATEGORISATION_MODEL=gpt-5.6-luna
AI_TIMEOUT_MS=5000
SEND_INTEREST_EMAILS=false

8. Run `SUPABASE_SETUP.sql` in Supabase.
9. Use `AUTOMATIC_DATA_SPREADSHEET_SETUP.md` for the live Google Sheet.
10. Use `GOOGLE_SEARCH_SETUP.md` for sitemap, favicon and indexing.
11. Test:
- homepage
- join form
- flag wall
- anonymous wall form
- DATA_DASHBOARD.html
- CSV export
