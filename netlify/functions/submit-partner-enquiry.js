const {clean, escapeHTML, eventHeaders, ipHash, isValidEmail, ok, parseJSONBody, rateLimit, sendEmail, supabase} = require("./common");

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(event.httpMethod !== "POST") return ok({ok:false,error:"Method not allowed"},405);

  try{
    if(!rateLimit(event, "partner-enquiry", 8, 60000)) return ok({ok:false,error:"Too many attempts. Please wait a moment and try again."},429);
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const b = parsed.body || {};
    if(b.website) return ok({ok:true});

    const row = {
      name: clean(b.name,160),
      email: clean(b.email,220).toLowerCase(),
      organisation: clean(b.organisation,180),
      role: clean(b.role,160),
      city_country: clean(b.city_country,220),
      support_type: clean(b.support_type,120),
      message: clean(b.message,1800),
      status: "new",
      user_agent: clean(eventHeaders(event)["user-agent"],500),
      ip_hash: ipHash(event)
    };

    if(!row.name || !row.email || !isValidEmail(row.email) || !row.support_type || !row.message) {
      return ok({ok:false,error:"Please add your name, valid email, support type and message."},400);
    }

    const saved = await supabase("trendies_partner_enquiries", {method:"POST", body: JSON.stringify(row)});

    const shouldEmail = String(process.env.SEND_PARTNER_EMAILS || "true").toLowerCase() !== "false";
    const emailResult = shouldEmail ? await sendEmail(
      `NEW Trendies partner enquiry — ${row.support_type}`,
      `<h2>New Trendies partner enquiry</h2>
      <p><b>Name:</b> ${escapeHTML(row.name)}</p>
      <p><b>Email:</b> ${escapeHTML(row.email)}</p>
      <p><b>Organisation:</b> ${escapeHTML(row.organisation)}</p>
      <p><b>Role:</b> ${escapeHTML(row.role)}</p>
      <p><b>City/country:</b> ${escapeHTML(row.city_country)}</p>
      <p><b>Support type:</b> ${escapeHTML(row.support_type)}</p>
      <hr/>
      <p>${escapeHTML(row.message)}</p>`,
      {required:false}
    ) : {sent:false, skipped:true};

    return ok({ok:true, id: saved && saved[0] && saved[0].id, email_sent: !!emailResult.sent});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
