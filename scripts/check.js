const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = process.cwd();
const required = [
  "index.html",
  "styles.css",
  "script.js",
  "SUPABASE_SETUP.sql",
  "DATA_DASHBOARD.html",
  "admin/index.html",
  "admin/emails.html",
  "admin/config.yml",
  "welcome.html",
  "preferences.html",
  "unsubscribe.html",
  "data/site-content.json",
  "data/blog-posts.json",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "site.webmanifest",
  "llms.txt",
  "ai.txt",
  "google-sheets-sync.gs",
  "AUTOMATIC_DATA_SPREADSHEET_SETUP.md",
  "GOOGLE_SEARCH_SETUP.md",
  "netlify.toml",
  "_redirects",
  "netlify/functions/submit-interest.js",
  "netlify/functions/dashboard-data.js",
  "netlify/functions/export-interests.js",
  "netlify/functions/email-helpers.js",
  "netlify/functions/signup-profile.js",
  "netlify/functions/preferences.js",
  "netlify/functions/unsubscribe.js",
  "netlify/functions/admin-email-campaign.js",
  "netlify/functions/admin-signup-action.js",
  "netlify/functions/chapter-cities.js",
  "netlify/functions/submit-partner-enquiry.js",
  "netlify/functions/weekly-digest.js",
  "netlify/functions/submit-map-pin.js",
  "netlify/functions/country-pins.js",
  "netlify/functions/submit-note.js",
  "netlify/functions/approved-notes.js"
];

let failed = false;

for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing required file: ${file}`);
    failed = true;
  }
}

const jsFiles = [
  "script.js",
  ...fs.readdirSync(path.join(root, "netlify/functions"))
    .filter((f) => f.endsWith(".js"))
    .map((f) => `netlify/functions/${f}`)
];

for (const file of jsFiles) {
  try {
    execFileSync(process.execPath, ["--check", path.join(root, file)], { stdio: "pipe" });
    console.log(`OK syntax: ${file}`);
  } catch (error) {
    console.error(`JS syntax failed: ${file}`);
    console.error(error.stderr?.toString() || error.message);
    failed = true;
  }
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "DATA_DASHBOARD.html"), "utf8");
const admin = fs.readFileSync(path.join(root, "admin/index.html"), "utf8");
const adminEmails = fs.readFileSync(path.join(root, "admin/emails.html"), "utf8");
const welcome = fs.readFileSync(path.join(root, "welcome.html"), "utf8");
const preferences = fs.readFileSync(path.join(root, "preferences.html"), "utf8");
const unsubscribe = fs.readFileSync(path.join(root, "unsubscribe.html"), "utf8");
const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
const netlify = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
const sql = fs.readFileSync(path.join(root, "SUPABASE_SETUP.sql"), "utf8");
const manifest = fs.readFileSync(path.join(root, "site.webmanifest"), "utf8");
const sheetsSync = fs.readFileSync(path.join(root, "google-sheets-sync.gs"), "utf8");
const llms = fs.readFileSync(path.join(root, "llms.txt"), "utf8");
const aiTxt = fs.readFileSync(path.join(root, "ai.txt"), "utf8");
const joinPhotos = (index.match(/<aside[^>]*class="join-photos"[\s\S]*?<\/aside>/) || [""])[0];
const bannedBrandPhrase = new RegExp("youth" + "-led", "i");
const allText = required
  .filter((file) => fs.existsSync(path.join(root, file)))
  .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
  .join("\n");

for (const file of ["data/site-content.json", "data/blog-posts.json"]) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    console.log(`OK JSON: ${file}`);
  } catch (error) {
    console.error(`JSON failed: ${file}`);
    console.error(error.message);
    failed = true;
  }
}

const checks = [
  ["hero has coming-of-age summer", /coming-of-age summer/i.test(index)],
  ["join form exists", /id="interestForm"/.test(index)],
  ["country input exists", /id="countryInput"/.test(index)],
  ["interest form photo stack is crop-safe", /chapter-marina-heart\.jpg/.test(joinPhotos) && /picnic-selfie\.jpg/.test(joinPhotos) && /london-laugh\.jpg/.test(joinPhotos) && !/srcset=/.test(joinPhotos)],
  ["community hub exists", /class="hub-strip"/.test(index)],
  ["clear coming-of-age community purpose", /want their coming of age, but does not want to do it alone/i.test(index) || /coming-of-age summer, not alone/i.test(index)],
  ["chapter notes exist", /id="blogGrid"/.test(index)],
  ["chapter city aggregates exist", /id="chapterCitiesGrid"/.test(index) && /\/api\/chapter-cities/.test(fs.readFileSync(path.join(root, "script.js"), "utf8"))],
  ["partner enquiry form exists", /id="partnerForm"/.test(index) && /submit-partner-enquiry/.test(index)],
  ["safety trust language exists", /id="safety"/.test(index) && /not a dating app/i.test(index) && /public, low-pressure/i.test(index)],
  ["live map toast exists", /id="mapLiveToast"/.test(index)],
  ["live wall toast exists", /id="wallLiveToast"/.test(index)],
  ["manifesto exists", /id="manifesto"/.test(index) && /Dear Trendies/i.test(index)],
  ["dashboard noindex", /noindex/i.test(dashboard)],
  ["dashboard is private CRM", /Trendies CRM/i.test(dashboard) && /Searchable signup table/i.test(dashboard) && /Partner enquiries/i.test(dashboard)],
  ["dashboard shows latest wall notes", /Latest wall notes/i.test(dashboard)],
  ["admin noindex", /noindex/i.test(admin)],
  ["admin emails page noindex", /noindex/i.test(adminEmails) && /type SEND/i.test(adminEmails) && /admin-email-campaign/.test(adminEmails)],
  ["welcome page noindex", /noindex/i.test(welcome) && /You are in Chapter One/i.test(welcome) && /referral/i.test(welcome)],
  ["preferences page noindex", /noindex/i.test(preferences) && /General Trendies updates/i.test(preferences)],
  ["unsubscribe page noindex", /noindex/i.test(unsubscribe) && /You can come back anytime/i.test(unsubscribe)],
  ["robots disallows dashboard", /Disallow:\s*\/DATA_DASHBOARD\.html/i.test(robots)],
  ["robots disallows admin", /Disallow:\s*\/admin\//i.test(robots)],
  ["robots disallows private token pages", /Disallow:\s*\/welcome/i.test(robots) && /Disallow:\s*\/preferences/i.test(robots) && /Disallow:\s*\/unsubscribe/i.test(robots)],
  ["ai summary files exist", /Trendies Global/i.test(llms) && /Trendies Global/i.test(aiTxt) && /Allow:\s*\/llms\.txt/i.test(robots) && /Allow:\s*\/ai\.txt/i.test(robots)],
  ["canonical domain is trendiesglobal.com", /https:\/\/trendiesglobal\.com\//i.test(index) && /https:\/\/trendiesglobal\.com\/sitemap\.xml/i.test(robots)],
  ["favicon and manifest configured", /<link[^>]+href="\/favicon\.svg"[^>]+rel="icon"/i.test(index) && /<link[^>]+href="\/site\.webmanifest"[^>]+rel="manifest"/i.test(index) && /Trendies Global/i.test(manifest)],
  ["google sheets automation exists", /setupTrendiesAutoSync/.test(sheetsSync) && /Clean Dataset/.test(sheetsSync) && /Dashboard/.test(sheetsSync) && /newChart\(\)/.test(sheetsSync)],
  ["netlify api redirect exists", /from\s*=\s*"\/api\/\*"/.test(netlify) && /to\s*=\s*"\/\.netlify\/functions\/:splat"/.test(netlify)],
  ["www redirects to apex domain", /www\.trendiesglobal\.com/.test(netlify) && /https:\/\/trendiesglobal\.com\/:splat/.test(netlify)],
  ["supabase interest columns exist", ["name","email","email_normalized","first_name","full_name","age","social","social_handle","city","country","wants_updates","confirmed_18_plus","activity_tags","answers","user_agent","ip_hash","region","respondent_type","partnership_type","intent_strength","helper_type","safety_tags","categorisation_source","ai_summary","ai_priority","ai_tags","referral_code","referred_by","email_preferences","unsubscribe_token","welcome_email_sent_at","unsubscribed_at","what_would_make_you_show_up","what_would_make_it_feel_safe","resend_contact_id"].every((col) => new RegExp(`\\b${col}\\b`).test(sql))],
  ["supabase email campaign tables exist", ["trendies_email_campaigns","trendies_email_deliveries","recipient_email","resend_email_id","audience_filter"].every((col) => new RegExp(`\\b${col}\\b`).test(sql))],
  ["supabase partner table exists", ["trendies_partner_enquiries","organisation","support_type","city_country"].every((col) => new RegExp(`\\b${col}\\b`).test(sql))],
  ["supabase city aggregate views exist", /trendies_interest_city_counts/.test(sql) && /trendies_interest_helper_type_counts/.test(sql) && /trendies_referral_counts/.test(sql)],
  ["supabase country pin columns exist", ["trendies_country_pins","country_normalized","flag","trendies_country_pin_counts"].every((col) => new RegExp(`\\b${col}\\b`).test(sql))],
  ["supabase wall note columns exist", ["trendies_wall_notes","note","note_censored","category","vibe","note_type","status","pending"].every((col) => new RegExp(`\\b${col}\\b`).test(sql))],
  ["traffic views exist", /trendies_dashboard_totals/.test(sql) && /trendies_country_pin_counts/.test(sql)],
  ["email mentioned in backend setup", /tende\.amery@gmail\.com/i.test(fs.readFileSync(path.join(root, "LIVE_BACKEND_SETUP.md"), "utf8"))],
  ["global flag wall exists", /class="flag-map" id="flagMap"/.test(index) && /Live global flag wall/i.test(index)],
  ["youtube embed removed for launch reliability", !/youtube\.com\/embed|youtu\.be|youtube-nocookie/i.test(index)],
  ["bad placeholder instagram absent", !/instagram\.com\/\//i.test(index)],
  ["known image srcset mismatches absent", !/src="assets\/paris-night\.jpg"[^>]+picnic-selfie/.test(index) && !/src="assets\/blue-portrait-smile-2\.jpg"[^>]+paris-night/.test(index) && !/src="assets\/grass-main-character\.jpg"[^>]+london-laugh/.test(index) && !/src="assets\/nyc-street\.jpg"[^>]+blue-portrait/.test(index)],
  ["api redirects file exists", /\/api\/\*/.test(fs.readFileSync(path.join(root, "_redirects"), "utf8"))],
  ["private clean redirects exist", /\/welcome\s+\/welcome\.html/.test(fs.readFileSync(path.join(root, "_redirects"), "utf8")) && /\/admin\/emails\s+\/admin\/emails\.html/.test(fs.readFileSync(path.join(root, "_redirects"), "utf8"))],
  ["banned wording absent", !bannedBrandPhrase.test(allText)]
];

for (const [name, ok] of checks) {
  if (ok) console.log(`OK check: ${name}`);
  else {
    console.error(`Failed check: ${name}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("All launch checks passed.");
