# Prompt to paste into Codex

You are working on the Trendies Global website. This is a launch-today project.

Use the current repository as the source of truth. Do not redesign the website. The current layout is approved. Focus on production readiness, deployment, and bug fixes only.

Goals:
1. Make sure the site can deploy cleanly to Netlify.
2. Make sure Netlify Functions work.
3. Make sure user inputs save into a categorised Supabase dataset.
4. Make sure every interest signup emails tende.amery@gmail.com.
5. Make sure DATA_DASHBOARD.html works as a private live dashboard using EXPORT_SECRET.
6. Make sure country flag pins can be submitted from the full country list and counts update.
7. Make sure wall notes save as pending.
8. Make sure the site is searchable on Google, but dashboard/admin/private pages are noindex.
9. Keep launch language:
   - coming-of-age summer
   - Chapter One
   - idea-stage
   - shaped by Trendies
   - picnics, bike rides, live music, card games, short films, exploring somewhere new
   - making new friends and expanding your circle
10. Avoid the banned youth-leadership wording.

Required tasks:
- Read AGENTS.md first.
- Run `npm test`.
- Fix any failures.
- Check `SUPABASE_SETUP.sql` covers all columns used by the functions.
- Check `LIVE_BACKEND_SETUP.md` and `LAUNCH_TODAY_CHECKLIST.md` are clear enough for a same-day launch.
- Make only necessary changes.
- At the end, summarise exactly what changed and what environment variables I must add to Netlify.

Important:
Do not remove the current layout.
Do not create a new design.
Do not add a countdown intro.
Do not create huge sections that make users scroll forever.
