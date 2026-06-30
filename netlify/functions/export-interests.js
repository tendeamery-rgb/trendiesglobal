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
    const rows = await supabase("trendies_interest_responses?select=*&order=created_at.desc&limit=10000",{method:"GET"});
    const headers = [
      "created_at","name","email","age","social","city","country","region",
      "respondent_type","partnership_type","intent_strength","activity_tags","safety_tags",
      "categorisation_source","ai_priority","ai_summary","ai_tags",
      "wants_updates","show_up_reason","safety_needs","help_build"
    ];

    const lines = [headers.join(",")];
    (rows||[]).forEach(r => {
      lines.push([
        r.created_at, r.name, r.email, r.age, r.social, r.city, r.country, r.region,
        r.respondent_type, r.partnership_type, r.intent_strength, r.activity_tags, r.safety_tags,
        r.categorisation_source, r.ai_priority, r.ai_summary, r.ai_tags,
        r.wants_updates, r.answers && r.answers.show_up_reason, r.answers && r.answers.safety_needs, r.answers && r.answers.help_build
      ].map(csvCell).join(","));
    });

    return {
      statusCode:200,
      headers:{
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":"attachment; filename=trendies-interest-responses.csv"
      },
      body:lines.join("\n")
    };
  }catch(e){
    return {statusCode:500, headers:{"Content-Type":"text/plain"}, body:e.message};
  }
};
