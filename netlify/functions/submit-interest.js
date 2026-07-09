const {
  ok,
  clean,
  escapeHTML,
  eventHeaders,
  parseJSONBody,
  ipHash,
  normalizeEmail,
  isValidEmail,
  randomToken,
  referralCode,
  rateLimit,
  supabase,
  sendEmail
} = require("./common");
const {
  emailPreferencesFromBody,
  firstNameFrom,
  referralLink,
  sendWelcomeEmail,
  upsertResendContact
} = require("./email-helpers");

function regionFor(countryRaw){
  const c = String(countryRaw || "").toLowerCase();
  const ukEurope = ["united kingdom","england","scotland","wales","ireland","france","spain","italy","germany","netherlands","portugal","belgium","sweden","norway","denmark","poland","greece","turkey"];
  const africa = ["uganda","kenya","nigeria","ghana","south africa","morocco","egypt","ethiopia","tanzania","rwanda","senegal","zimbabwe"];
  const northAmerica = ["united states","usa","us","canada","mexico"];
  const latinAmerica = ["brazil","colombia","argentina","chile","peru","venezuela","costa rica","jamaica","barbados"];
  const asia = ["india","china","japan","south korea","korea","thailand","singapore","philippines","indonesia","pakistan","nepal","sri lanka","vietnam","malaysia","uae","united arab emirates"];
  const oceania = ["australia","new zealand"];
  if(ukEurope.some(x => c.includes(x))) return "UK / Europe";
  if(africa.some(x => c.includes(x))) return "Africa";
  if(northAmerica.some(x => c.includes(x))) return "North America";
  if(latinAmerica.some(x => c.includes(x))) return "Latin America / Caribbean";
  if(asia.some(x => c.includes(x))) return "Asia / Middle East";
  if(oceania.some(x => c.includes(x))) return "Oceania";
  return "Other / needs review";
}

function categorise(body){
  const text = Object.values(body).join(" ").toLowerCase();
  const activity_tags = [];
  const safety_tags = [];
  let respondent_type = "general trendie";
  let partnership_type = "none";
  let intent_strength = "curious";

  const add = (arr, tag) => { if(!arr.includes(tag)) arr.push(tag); };

  if(/picnic|blanket|park|food|snack|sun|golden hour/.test(text)) add(activity_tags, "picnics / park plans");
  if(/bike|cycle|ride/.test(text)) add(activity_tags, "bike rides");
  if(/live music|concert|gig|music|festival/.test(text)) add(activity_tags, "live music");
  if(/card|games|uno|board game/.test(text)) add(activity_tags, "card games");
  if(/short film|film|photo|camera|shoot|content|creator|tiktok|reel/.test(text)) add(activity_tags, "short films / creator moments");
  if(/walk|explore|gallery|museum|market|river|beach|new place|somewhere new|city/.test(text)) add(activity_tags, "exploring somewhere new");
  if(!activity_tags.length) add(activity_tags, "general coming-of-age summer");

  if(/daylight|day time|public|safe|clear|friend|small group|arrive alone|alone|meetup|trusted|verified/.test(text)) {
    if(/daylight|day time/.test(text)) add(safety_tags, "daylight");
    if(/public/.test(text)) add(safety_tags, "public place");
    if(/clear|details|plan/.test(text)) add(safety_tags, "clear plan/details");
    if(/small group/.test(text)) add(safety_tags, "small group");
    if(/friend|bring/.test(text)) add(safety_tags, "bring a friend");
    if(/alone|arrive alone/.test(text)) add(safety_tags, "okay to arrive alone");
  }
  if(!safety_tags.length) add(safety_tags, "not specified");

  const help = String(body.help_build || "").toLowerCase();
  if(/brand|venue|partner|sponsor/.test(help + " " + text)) {
    respondent_type = "potential partner";
    partnership_type = "brand / venue / sponsor";
  } else if(/photographer|filmmaker|creative|photo|film|design|content/.test(help + " " + text)) {
    respondent_type = "creative collaborator";
    partnership_type = "creative";
  } else if(/organise|organizer|organiser|volunteer|help in my city|city|country/.test(help)) {
    respondent_type = "city helper / organiser";
    partnership_type = "city chapter helper";
  } else if(/student society|society|university|school/.test(text)) {
    respondent_type = "student community lead";
    partnership_type = "student society / campus";
  }

  if(/definitely|need this|i would come|i’ll come|i will come|count me in|yes|love/.test(text)) intent_strength = "strong";
  if(/maybe|curious|interested|depends/.test(text)) intent_strength = "warm";

  return {activity_tags, safety_tags, respondent_type, partnership_type, intent_strength};
}

function truthy(value){
  return value === true || ["true", "1", "yes", "on"].includes(String(value || "").toLowerCase());
}

function responseText(data){
  if(data && typeof data.output_text === "string") return data.output_text;
  const chunks = [];
  for(const item of data && data.output ? data.output : []) {
    for(const part of item.content || []) {
      if(part.type === "output_text" && part.text) chunks.push(part.text);
    }
  }
  return chunks.join("\n");
}

function normaliseAI(raw){
  const allowedPriority = ["urgent", "hot", "warm", "curious", "partner", "needs review"];
  const priority = allowedPriority.includes(String(raw.ai_priority || "").toLowerCase())
    ? String(raw.ai_priority).toLowerCase()
    : "needs review";
  const tags = Array.isArray(raw.ai_tags)
    ? raw.ai_tags.map((tag) => clean(tag, 60)).filter(Boolean).slice(0, 8)
    : [];
  return {
    ai_summary: clean(raw.ai_summary, 500),
    ai_priority: priority,
    ai_tags: tags
  };
}

async function aiCategorise(body, ruleCategories){
  if(!process.env.OPENAI_API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 5000));
  try{
    const input = {
      city: clean(body.city, 120),
      country: clean(body.country, 120),
      show_up_reason: clean(body.show_up_reason, 900),
      safety_needs: clean(body.safety_needs, 900),
      help_build: clean(body.help_build, 300),
      rule_categories: ruleCategories
    };

    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_CATEGORISATION_MODEL || "gpt-5.4-mini",
        input: [
          {
            role: "system",
            content: "You categorise Trendies Global interest form submissions for the private owner dashboard. Return only compact JSON with keys ai_summary, ai_priority and ai_tags. Keep it safe, practical and easy for a non-technical founder to understand."
          },
          {
            role: "user",
            content: JSON.stringify(input)
          }
        ],
        text: {format: {type: "json_object"}, verbosity: "low"}
      })
    });

    const data = await res.json().catch(() => ({}));
    if(!res.ok) throw new Error(data.error && data.error.message ? data.error.message : `OpenAI returned ${res.status}`);
    const text = responseText(data).replace(/^```json\s*|\s*```$/g, "").trim();
    return normaliseAI(JSON.parse(text || "{}"));
  }catch(error){
    console.error("AI categorisation skipped:", error.message);
    return null;
  }finally{
    clearTimeout(timeout);
  }
}

async function findExistingSignup(email){
  const encoded = encodeURIComponent(email);
  const byNormalised = await supabase(`trendies_interest_responses?email_normalized=eq.${encoded}&select=*&limit=1`, {method:"GET"});
  if(byNormalised && byNormalised[0]) return byNormalised[0];
  const byLegacyEmail = await supabase(`trendies_interest_responses?email=eq.${encoded}&select=*&limit=1`, {method:"GET"});
  return byLegacyEmail && byLegacyEmail[0] ? byLegacyEmail[0] : null;
}

async function patchSignup(id, body){
  const rows = await supabase(`trendies_interest_responses?id=eq.${encodeURIComponent(id)}`, {
    method:"PATCH",
    body: JSON.stringify(body)
  });
  return rows && rows[0] ? rows[0] : body;
}

async function insertSignup(body){
  const rows = await supabase("trendies_interest_responses", {
    method:"POST",
    body: JSON.stringify(body)
  });
  return rows && rows[0] ? rows[0] : body;
}

async function logDelivery(row){
  try{
    await supabase("trendies_email_deliveries", {method:"POST", body: JSON.stringify(row)});
  }catch(error){
    console.error("Email delivery log skipped:", error.message);
  }
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(event.httpMethod !== "POST") return ok({ok:false,error:"Method not allowed"},405);

  try{
    if(!rateLimit(event, "submit-interest", 12, 60000)) return ok({ok:false,error:"Too many signup attempts. Please wait a moment and try again."},429);
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const b = parsed.body;
    if(b.website) return ok({ok:true});

    const fullName = clean(b.full_name || b.name, 160);
    const email = normalizeEmail(b.email);
    const age = Number(b.age || 0);
    const confirmed18 = (truthy(b.confirm_18) || truthy(b.confirmed_18_plus)) && age >= 18;
    if(!fullName || !email || !isValidEmail(email) || !clean(b.city,160) || !clean(b.country,160) || !confirmed18 || age > 120) {
      return ok({ok:false,error:"Please complete the required fields with a valid email and confirm you are 18+."},400);
    }

    const cats = categorise(b);
    const ai = await aiCategorise(b, cats);
    const existing = await findExistingSignup(email);
    const existingToken = existing && existing.unsubscribe_token;
    const unsubscribeToken = existingToken || randomToken(24);
    const code = (existing && existing.referral_code) || referralCode(email);
    const wantsUpdates = truthy(b.updates_permission) || truthy(b.wants_updates);
    const now = new Date().toISOString();
    const showUpReason = clean(b.what_would_make_you_show_up || b.show_up_reason,1200);
    const safetyNeeds = clean(b.what_would_make_it_feel_safe || b.safety_needs,1200);
    const helperType = clean(b.helper_type || b.help_build,300);

    const row = {
      created_at: existing && existing.created_at ? existing.created_at : now,
      updated_at: now,
      name: fullName,
      full_name: fullName,
      first_name: firstNameFrom(fullName),
      email,
      email_normalized: email,
      age,
      social: clean(b.social_handle || b.social,160),
      social_handle: clean(b.social_handle || b.social,160),
      city: clean(b.city,160),
      country: clean(b.country,160),
      region: regionFor(b.country),
      wants_updates: wantsUpdates,
      confirmed_18_plus: confirmed18,
      helper_type: helperType,
      what_would_make_you_show_up: showUpReason,
      what_would_make_it_feel_safe: safetyNeeds,
      referral_code: code,
      referred_by: clean(b.referred_by || b.referral_source || b.ref,80),
      signup_source: clean(b.signup_source || "website_interest_form",120),
      email_preferences: emailPreferencesFromBody(b),
      unsubscribe_token: unsubscribeToken,
      unsubscribed_at: wantsUpdates ? null : ((existing && existing.unsubscribed_at) || null),
      respondent_type: cats.respondent_type,
      partnership_type: cats.partnership_type,
      intent_strength: cats.intent_strength,
      activity_tags: cats.activity_tags,
      safety_tags: cats.safety_tags,
      categorisation_source: ai ? "rules + ai" : "rules",
      ai_summary: ai ? ai.ai_summary : "",
      ai_priority: ai ? ai.ai_priority : "",
      ai_tags: ai ? ai.ai_tags : [],
      welcome_email_sent_at: existing && existing.welcome_email_sent_at ? existing.welcome_email_sent_at : null,
      answers: {
        show_up_reason: showUpReason,
        safety_needs: safetyNeeds,
        help_build: helperType,
        wants_updates: wantsUpdates,
        confirmed_18_plus: confirmed18
      },
      user_agent: clean(eventHeaders(event)["user-agent"],500),
      ip_hash: ipHash(event)
    };

    const saved = existing ? await patchSignup(existing.id, row) : await insertSignup(row);

    const contactResult = await upsertResendContact({...row, id:saved.id});
    if(contactResult && (contactResult.error || contactResult.id)) {
      await patchSignup(saved.id, {
        resend_contact_id: contactResult.id || (existing && existing.resend_contact_id) || null,
        last_resend_error: contactResult.error || ""
      });
    }

    let welcomeResult = {sent:false, skipped:true};
    if(row.confirmed_18_plus && !row.unsubscribed_at && !(existing && existing.welcome_email_sent_at)) {
      welcomeResult = await sendWelcomeEmail({...row, id:saved.id});
      await patchSignup(saved.id, {
        welcome_email_sent_at: welcomeResult.sent ? new Date().toISOString() : null,
        welcome_email_last_error: welcomeResult.error || ""
      });
      await logDelivery({
        campaign_id: null,
        recipient_email: row.email,
        recipient_user_id: saved.id,
        resend_email_id: welcomeResult.id || null,
        status: welcomeResult.sent ? "sent" : "failed",
        error_message: welcomeResult.error || "",
        sent_at: new Date().toISOString()
      });
    }

    const shouldEmail = String(process.env.SEND_INTEREST_EMAILS || "true").toLowerCase() !== "false";
    const signupMode = existing ? "updated existing signup" : "new signup";
    const emailResult = shouldEmail
      ? await sendEmail(
        "New Trendies signup",
        `<h2>New Trendies Global signup</h2>
        <p><b>Signup type:</b> ${escapeHTML(signupMode)}</p>
        <p><b>${escapeHTML(row.name)}</b> (${escapeHTML(row.age)}) — ${escapeHTML(row.email)}</p>
        <p><b>Location:</b> ${escapeHTML(row.city)}, ${escapeHTML(row.country)} / ${escapeHTML(row.region)}</p>
        <p><b>Wants updates:</b> ${row.wants_updates ? "Yes" : "No"}</p>
        <p><b>Confirmed 18+:</b> ${row.confirmed_18_plus ? "Yes" : "No"}</p>
        <p><b>Respondent type:</b> ${escapeHTML(row.respondent_type)}</p>
        <p><b>Partnership type:</b> ${escapeHTML(row.partnership_type)}</p>
        <p><b>Intent:</b> ${escapeHTML(row.intent_strength)}</p>
        <p><b>Activity tags:</b> ${escapeHTML(row.activity_tags.join(", "))}</p>
        <p><b>Safety tags:</b> ${escapeHTML(row.safety_tags.join(", "))}</p>
        <p><b>AI/source:</b> ${escapeHTML(row.categorisation_source)}${row.ai_priority ? " / " + escapeHTML(row.ai_priority) : ""}</p>
        ${row.ai_summary ? `<p><b>AI summary:</b><br/>${escapeHTML(row.ai_summary)}</p>` : ""}
        <hr/>
        <p><b>What would make them show up?</b><br/>${escapeHTML(row.answers.show_up_reason || "")}</p>
        <p><b>Safety needs:</b><br/>${escapeHTML(row.answers.safety_needs || "")}</p>
        <p><b>Help / partnership:</b><br/>${escapeHTML(row.answers.help_build || "")}</p>`,
        {required:false}
      )
      : {sent:false, skipped:true};

    const emailStatus = welcomeResult.sent ? "sent" : (welcomeResult.error ? "issue" : "skipped");
    const successMessage = existing
      ? "You’re already on the list. I’ve updated your details."
      : (welcomeResult.error
        ? "You’re in Chapter One. Your signup was saved, but the welcome email may not have sent."
        : "You’re in Chapter One. Check your email — your welcome note is on its way.");
    return ok({
      ok:true,
      deduped: !!existing,
      signup_status: signupMode,
      message: successMessage,
      id: saved.id,
      email_sent: !!(emailResult && emailResult.sent),
      admin_email_sent: !!(emailResult && emailResult.sent),
      welcome_email_sent: !!(welcomeResult && welcomeResult.sent),
      welcome_email_error: welcomeResult.error || "",
      resend_contact_synced: !!(contactResult && contactResult.synced),
      referral_code: row.referral_code,
      referral_link: referralLink(row.referral_code),
      redirect_url: `/welcome?token=${encodeURIComponent(row.unsubscribe_token)}&email=${encodeURIComponent(emailStatus)}`,
      email_skipped: !!(emailResult && emailResult.skipped),
      categories:{
      region: row.region,
      respondent_type: row.respondent_type,
      partnership_type: row.partnership_type,
      intent_strength: row.intent_strength,
      activity_tags: row.activity_tags,
      safety_tags: row.safety_tags,
      categorisation_source: row.categorisation_source,
      ai_summary: row.ai_summary,
      ai_priority: row.ai_priority,
      ai_tags: row.ai_tags
    }});
  }catch(e){
    console.error(e);
    return ok({ok:false,error:e.message},500);
  }
};
