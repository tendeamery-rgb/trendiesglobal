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

8. Run `SUPABASE_SETUP.sql` in Supabase.
9. Test:
- homepage
- join form
- flag wall
- anonymous wall form
- DATA_DASHBOARD.html
- CSV export
