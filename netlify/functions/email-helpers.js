const {
  clean,
  escapeHTML,
  fromEmail,
  resendRequest,
  sendEmailTo,
  siteUrl
} = require("./common");

const DEFAULT_EMAIL_PREFERENCES = {
  general_updates: true,
  city_chapter_updates: true,
  volunteer_helper_updates: true,
  creative_opportunities: true,
  brand_partner_updates: true
};

function emailPreferencesFromBody(body={}){
  const raw = body.email_preferences && typeof body.email_preferences === "object"
    ? body.email_preferences
    : {};
  return {
    general_updates: raw.general_updates !== false,
    city_chapter_updates: raw.city_chapter_updates !== false,
    volunteer_helper_updates: raw.volunteer_helper_updates !== false,
    creative_opportunities: raw.creative_opportunities !== false,
    brand_partner_updates: raw.brand_partner_updates !== false
  };
}

function firstNameFrom(fullName){
  return clean(fullName, 160).split(" ").filter(Boolean)[0] || "there";
}

function preferencesUrl(token){
  return `${siteUrl()}/preferences?token=${encodeURIComponent(token || "")}`;
}

function unsubscribeUrl(token){
  return `${siteUrl()}/unsubscribe?token=${encodeURIComponent(token || "")}`;
}

function referralLink(code){
  return code ? `${siteUrl()}/?ref=${encodeURIComponent(code)}` : "";
}

function emailButton(label, url){
  if(!label || !url) return "";
  return `<p style="margin:24px 0 4px;">
    <a href="${escapeHTML(url)}" style="display:inline-block;background:#15110f;color:#fff9ef;text-decoration:none;border-radius:999px;padding:13px 18px;font-weight:900;letter-spacing:.01em;">
      ${escapeHTML(label)}
    </a>
  </p>`;
}

function emailShell({preview="", body="", token=""}){
  return `<!doctype html>
  <html>
    <body style="margin:0;background:#f6eadb;color:#15110f;font-family:Inter,Arial,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;">${escapeHTML(preview)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6eadb;margin:0;padding:0;">
        <tr>
          <td align="center" style="padding:28px 14px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;border-collapse:separate;border-spacing:0;">
              <tr>
                <td style="background:#15110f;color:#fff9ef;border-radius:24px 24px 0 0;padding:22px 26px;text-align:left;">
                  <p style="letter-spacing:.16em;text-transform:uppercase;font-size:12px;font-weight:900;color:#9fd4e9;margin:0 0 8px;">Trendies Global</p>
                  <p style="font-family:Georgia,serif;font-size:28px;line-height:1;margin:0;">Chapter One</p>
                </td>
              </tr>
              <tr>
                <td style="border-left:1px solid #ead8ba;border-right:1px solid #ead8ba;background:#fffaf2;padding:30px 26px;font-size:16px;line-height:1.62;">
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="border:1px solid #ead8ba;border-top:0;border-radius:0 0 24px 24px;background:#fff3df;padding:20px 26px;">
                  <p style="font-size:13px;color:#6f6257;line-height:1.55;margin:0 0 8px;">
                    You can update your preferences or unsubscribe at any time:
                    <a href="${preferencesUrl(token)}" style="color:#2f6f8f;">preferences</a> /
                    <a href="${unsubscribeUrl(token)}" style="color:#2f6f8f;">unsubscribe</a>.
                  </p>
                  <p style="font-size:12px;color:#8a7a6f;margin:0;">Trendies Global. Safe, public, low-pressure plans for Chapter One.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function welcomeEmail(signup){
  const first = escapeHTML(signup.first_name || firstNameFrom(signup.full_name || signup.name));
  const ref = referralLink(signup.referral_code);
  const preferences = preferencesUrl(signup.unsubscribe_token);
  const body = `
    <p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;font-weight:900;color:#2f6f8f;margin:0 0 12px;">You are in</p>
    <h1 style="font-family:Georgia,serif;font-size:38px;line-height:.98;margin:0 0 18px;">Welcome to Chapter One.</h1>
    <p style="margin:0 0 14px;">Hey ${first},</p>
    <p style="margin:0 0 14px;">You are officially on the early Trendies Global interest list.</p>
    <p style="margin:0 0 14px;">Trendies started with a simple feeling: so many of us want our coming-of-age chapter, but we do not want to do it alone. We want the picnic, the walk through the city, the card games, the music, the golden hour, the new friends, the slightly terrifying but beautiful feeling of saying yes to life again.</p>
    <p style="margin:0 0 14px;">This is still early, but that is what makes it exciting. Chapter One is being shaped by the people who sign up: where you are, what you would actually show up for, and what would make it feel safe.</p>
    <p style="margin:18px 0 8px;"><b>A few things to know:</b></p>
    <ul style="margin-top:0;padding-left:20px;">
      <li>You are not buying a ticket.</li>
      <li>You are not committing to anything.</li>
      <li>You are simply helping show where the first Trendies chapters could begin.</li>
    </ul>
    <p style="margin:0 0 14px;">For now, follow along, invite a friend who would understand the vision, and keep an eye out for updates about first meetups, city interest, creative opportunities, and ways to help build this.</p>
    <p style="margin:0 0 14px;">The aim is simple: safe, public, low-pressure plans that make it easier to meet people who also want to live a little more fully.</p>
    ${ref ? `<p><b>Invite one friend into Chapter One:</b><br/><a href="${ref}" style="color:#2f6f8f;">${escapeHTML(ref)}</a></p>` : ""}
    <p style="margin:18px 0 14px;">Welcome to Chapter One.</p>
    <p style="margin:0 0 14px;">Stay trendy,<br/>Tende<br/>Trendies Global</p>
    <p style="margin:0;"><b>P.S.</b> You can update your preferences or unsubscribe at any time here:<br/><a href="${preferences}" style="color:#2f6f8f;">${preferences}</a></p>
  `;
  return {
    subject: "Welcome to Chapter One 🌍",
    html: emailShell({preview:"You are officially on the early Trendies Global interest list.", body, token: signup.unsubscribe_token})
  };
}

async function sendWelcomeEmail(signup, options={}){
  const email = welcomeEmail(signup);
  return sendEmailTo({
    to: signup.email,
    subject: email.subject,
    html: email.html,
    required: !!options.required
  });
}

function contactProperties(signup){
  return {
    first_name: clean(signup.first_name || firstNameFrom(signup.full_name || signup.name), 120),
    full_name: clean(signup.full_name || signup.name, 160),
    email: clean(signup.email, 220),
    city: clean(signup.city, 120),
    country: clean(signup.country, 120),
    helper_type: clean(signup.helper_type || signup.respondent_type, 120),
    signup_source: clean(signup.signup_source || "website_interest_form", 120),
    referral_code: clean(signup.referral_code, 80),
    respondent_type: clean(signup.respondent_type, 120)
  };
}

async function upsertResendContact(signup){
  if(!signup || !signup.email) return {synced:false, skipped:true};
  if(!signup.wants_updates && !signup.unsubscribed_at) return {synced:false, skipped:true};
  const names = String(signup.full_name || signup.name || "").trim().split(/\s+/).filter(Boolean);
  const createPayload = {
    email: signup.email,
    first_name: signup.first_name || names[0] || "",
    last_name: names.slice(1).join(" "),
    unsubscribed: !!signup.unsubscribed_at,
    properties: contactProperties(signup)
  };
  const updatePayload = {
    unsubscribed: !!signup.unsubscribed_at,
    properties: contactProperties(signup)
  };

  try{
    const updated = await resendRequest(`contacts/${encodeURIComponent(signup.email)}`, {method:"PATCH", body: updatePayload});
    return {synced:true, mode:"updated", id: updated && updated.id};
  }catch(error){
    if(error.status && error.status !== 404) {
      console.error("Resend contact update failed:", error.message);
    }
    try{
      const created = await resendRequest("contacts", {method:"POST", body: createPayload});
      return {synced:true, mode:"created", id: created && created.id};
    }catch(createError){
      console.error("Resend contact create failed:", createError.message);
      return {synced:false, error:createError.message};
    }
  }
}

function broadcastEmail({subject, previewText, body, ctaLabel, ctaUrl, signup}){
  const safeBody = escapeHTML(body).replace(/\n/g, "<br/>");
  const cta = emailButton(ctaLabel, ctaUrl);
  return {
    from: fromEmail(),
    to: [signup.email],
    subject,
    html: emailShell({
      preview: previewText,
      token: signup.unsubscribe_token,
      body: `
        <p style="letter-spacing:.12em;text-transform:uppercase;font-size:12px;font-weight:900;color:#2f6f8f;margin:0 0 12px;">Trendies update</p>
        <h1 style="font-family:Georgia,serif;font-size:34px;line-height:1;margin:0 0 18px;">${escapeHTML(subject)}</h1>
        <p style="margin:0 0 14px;">Hey ${escapeHTML(signup.first_name || firstNameFrom(signup.full_name || signup.name))},</p>
        <div style="background:#ffffff;border:1px solid #ead8ba;border-radius:18px;padding:18px;margin:0 0 18px;">
          <p style="margin:0;">${safeBody}</p>
        </div>
        ${cta}
        <p style="margin:22px 0 0;">Stay trendy,<br/>Tende<br/>Trendies Global</p>
      `
    })
  };
}

module.exports = {
  DEFAULT_EMAIL_PREFERENCES,
  emailPreferencesFromBody,
  firstNameFrom,
  preferencesUrl,
  unsubscribeUrl,
  referralLink,
  welcomeEmail,
  sendWelcomeEmail,
  upsertResendContact,
  broadcastEmail
};
