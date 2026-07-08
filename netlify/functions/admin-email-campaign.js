const {
  adminEmail,
  clean,
  ok,
  parseJSONBody,
  rateLimit,
  requireAdmin,
  sendBatchEmails,
  sendEmailTo,
  supabase
} = require("./common");
const {broadcastEmail} = require("./email-helpers");

function chunk(items, size){
  const chunks = [];
  for(let i=0; i<items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function matchesAudience(row, filters={}){
  const text = `${row.helper_type || ""} ${row.respondent_type || ""} ${row.partnership_type || ""} ${row.what_would_make_you_show_up || ""} ${row.answers && row.answers.help_build || ""}`.toLowerCase();
  if(filters.country && !String(row.country || "").toLowerCase().includes(String(filters.country).toLowerCase())) return false;
  if(filters.city && !String(row.city || "").toLowerCase().includes(String(filters.city).toLowerCase())) return false;
  if(filters.helper_type && !text.includes(String(filters.helper_type).toLowerCase())) return false;
  if(filters.creative && !/creative|photo|film|design|content/.test(text)) return false;
  if(filters.volunteers && !/volunteer|organise|organizer|organiser|city helper|help in my city|help in my country/.test(text)) return false;
  if(filters.partners && !/brand|venue|partner|sponsor|space|cafe/.test(text)) return false;
  return true;
}

async function eligibleRecipients(filters={}){
  const rows = await supabase("trendies_interest_responses?wants_updates=eq.true&confirmed_18_plus=eq.true&unsubscribed_at=is.null&email_bounced_at=is.null&select=*&order=created_at.desc&limit=5000", {method:"GET"});
  const seen = new Set();
  return (rows || []).filter((row) => {
    if(!row.email || seen.has(row.email)) return false;
    seen.add(row.email);
    return matchesAudience(row, filters);
  });
}

async function createCampaign(body, status, count){
  const rows = await supabase("trendies_email_campaigns", {
    method:"POST",
    body: JSON.stringify({
      subject: clean(body.subject, 200),
      preview_text: clean(body.preview_text, 220),
      body: clean(body.body, 8000),
      cta_label: clean(body.cta_label, 120),
      cta_url: clean(body.cta_url, 500),
      sent_by: adminEmail(),
      audience_filter: body.filters || {},
      recipient_count: count,
      status,
      resend_email_ids: []
    })
  });
  return rows && rows[0] ? rows[0] : null;
}

async function patchCampaign(id, body){
  if(!id) return null;
  const rows = await supabase(`trendies_email_campaigns?id=eq.${encodeURIComponent(id)}`, {
    method:"PATCH",
    body: JSON.stringify(body)
  });
  return rows && rows[0] ? rows[0] : null;
}

async function logDeliveries(rows){
  if(!rows.length) return;
  await supabase("trendies_email_deliveries", {method:"POST", body: JSON.stringify(rows)});
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(event.httpMethod !== "POST") return ok({ok:false,error:"Method not allowed"},405);

  try{
    if(!rateLimit(event, "admin-email-campaign", 40, 60000)) return ok({ok:false,error:"Too many admin email requests. Please wait a moment."},429);
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const body = parsed.body || {};
    if(!requireAdmin(event, body)) return ok({ok:false,error:"Missing or incorrect admin password"},401);

    const action = body.action || "audience";
    const recipients = await eligibleRecipients(body.filters || {});

    if(action === "audience") {
      return ok({
        ok:true,
        recipient_count: recipients.length,
        sample: recipients.slice(0, 12).map(r => ({
          first_name: r.first_name || r.name || "",
          email: r.email,
          city: r.city,
          country: r.country,
          helper_type: r.helper_type || r.respondent_type || ""
        }))
      });
    }

    if(!clean(body.subject, 200) || !clean(body.body, 8000)) {
      return ok({ok:false,error:"Subject and body are required."},400);
    }

    if(action === "test") {
      const fakeSignup = {
        email: adminEmail(),
        first_name: "Tende",
        name: "Tende",
        unsubscribe_token: "test",
        referral_code: ""
      };
      const message = broadcastEmail({
        subject: clean(body.subject, 200),
        previewText: clean(body.preview_text, 220),
        body: clean(body.body, 8000),
        ctaLabel: clean(body.cta_label, 120),
        ctaUrl: clean(body.cta_url, 500),
        signup: fakeSignup
      });
      const result = await sendEmailTo({to: adminEmail(), subject: message.subject, html: message.html, required:true});
      return ok({ok:true, test_sent:true, resend_email_id: result.id || null, eligible_recipients: recipients.length});
    }

    if(action !== "send") return ok({ok:false,error:"Unknown action"},400);
    if(body.confirm !== "SEND") return ok({ok:false,error:"Final confirmation required. Type SEND to broadcast."},400);
    if(!recipients.length) return ok({ok:false,error:"No eligible recipients for this audience."},400);

    const campaign = await createCampaign(body, "sending", recipients.length);
    const resendIds = [];
    let sent = 0;
    let failed = 0;

    for(const group of chunk(recipients, 100)){
      const messages = group.map(signup => broadcastEmail({
        subject: clean(body.subject, 200),
        previewText: clean(body.preview_text, 220),
        body: clean(body.body, 8000),
        ctaLabel: clean(body.cta_label, 120),
        ctaUrl: clean(body.cta_url, 500),
        signup
      }));
      const result = await sendBatchEmails(messages, false);
      const ids = Array.isArray(result.data) ? result.data : [];
      const deliveryRows = group.map((signup, i) => {
        const id = ids[i] && ids[i].id;
        if(id) {
          sent += 1;
          resendIds.push(id);
        } else {
          failed += 1;
        }
        return {
          campaign_id: campaign && campaign.id,
          recipient_email: signup.email,
          recipient_user_id: signup.id,
          resend_email_id: id || null,
          status: id ? "sent" : "failed",
          error_message: id ? "" : (result.error || "No Resend id returned"),
          sent_at: new Date().toISOString()
        };
      });
      await logDeliveries(deliveryRows);
    }

    await patchCampaign(campaign && campaign.id, {
      status: failed ? "sent_with_errors" : "sent",
      sent_at: new Date().toISOString(),
      resend_email_ids: resendIds
    });

    return ok({ok:true, campaign_id: campaign && campaign.id, sent, failed, recipient_count: recipients.length});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
