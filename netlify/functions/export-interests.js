const {supabase} = require("./common");

function requireToken(event){
  const supplied = (event.queryStringParameters && event.queryStringParameters.token) || "";
  const secret = process.env.EXPORT_SECRET || "";
  return secret && supplied && supplied === secret;
}

function csvCell(v){
  if(Array.isArray(v)) v = v.join("; ");
  if(v && typeof v === "object") v = JSON.stringify(v);
  const s = String(v ?? "");
  return `"${s.replace(/"/g,'""')}"`;
}

exports.handler = async (event) => {
  if(!requireToken(event)) {
    return {statusCode:401, headers:{"Content-Type":"text/plain"}, body:"Missing or incorrect export token"};
  }

  try{
    const requestedLimit = Number(event.queryStringParameters && event.queryStringParameters.limit);
    const requestedOffset = Number(event.queryStringParameters && event.queryStringParameters.offset);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 5000)
      : 10000;
    const offset = Number.isFinite(requestedOffset) && requestedOffset > 0
      ? Math.floor(requestedOffset)
      : 0;

    const rows = await supabase(`trendies_interest_responses?select=*&order=created_at.desc&limit=${limit}&offset=${offset}`,{method:"GET"});
    const headers = [
      "created_at","updated_at","first_name","full_name","name","email","email_normalized","age","social","social_handle","city","country","region",
      "respondent_type","partnership_type","intent_strength","helper_type","activity_tags","safety_tags",
      "categorisation_source","ai_priority","ai_summary","ai_tags",
      "wants_updates","confirmed_18_plus","unsubscribed_at","welcome_email_sent_at","referral_code","referred_by",
      "show_up_reason","safety_needs","help_build"
    ];

    const lines = [headers.join(",")];
    (rows||[]).forEach(r => {
      lines.push([
        r.created_at, r.updated_at, r.first_name, r.full_name, r.name, r.email, r.email_normalized, r.age, r.social, r.social_handle, r.city, r.country, r.region,
        r.respondent_type, r.partnership_type, r.intent_strength, r.helper_type, r.activity_tags, r.safety_tags,
        r.categorisation_source, r.ai_priority, r.ai_summary, r.ai_tags,
        r.wants_updates, r.confirmed_18_plus, r.unsubscribed_at, r.welcome_email_sent_at, r.referral_code, r.referred_by,
        r.what_would_make_you_show_up || (r.answers && r.answers.show_up_reason),
        r.what_would_make_it_feel_safe || (r.answers && r.answers.safety_needs),
        r.helper_type || (r.answers && r.answers.help_build)
      ].map(csvCell).join(","));
    });

    return {
      statusCode:200,
      headers:{
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":"attachment; filename=trendies-interest-responses.csv",
        "Cache-Control":"no-store"
      },
      body:lines.join("\n")
    };
  }catch(e){
    return {statusCode:500, headers:{"Content-Type":"text/plain"}, body:e.message};
  }
};
