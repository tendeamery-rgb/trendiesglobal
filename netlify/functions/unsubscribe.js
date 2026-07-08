const {ok, parseJSONBody, supabase} = require("./common");
const {upsertResendContact} = require("./email-helpers");

async function findByToken(token){
  const rows = await supabase(`trendies_interest_responses?unsubscribe_token=eq.${encodeURIComponent(token)}&select=*&limit=1`, {method:"GET"});
  return rows && rows[0] ? rows[0] : null;
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(!["GET","POST"].includes(event.httpMethod)) return ok({ok:false,error:"Method not allowed"},405);

  try{
    let token = event.queryStringParameters && event.queryStringParameters.token;
    if(event.httpMethod === "POST") {
      const parsed = parseJSONBody(event);
      if(parsed.error) return parsed.error;
      token = (parsed.body && parsed.body.token) || token;
    }
    if(!token) return ok({ok:false,error:"Missing token"},401);
    const signup = await findByToken(token);
    if(!signup) return ok({ok:false,error:"Signup not found"},404);

    const now = new Date().toISOString();
    const rows = await supabase(`trendies_interest_responses?id=eq.${encodeURIComponent(signup.id)}`, {
      method:"PATCH",
      body: JSON.stringify({
        wants_updates: false,
        unsubscribed_at: signup.unsubscribed_at || now,
        email_preferences: {
          general_updates: false,
          city_chapter_updates: false,
          volunteer_helper_updates: false,
          creative_opportunities: false,
          brand_partner_updates: false
        },
        updated_at: now
      })
    });
    const updated = rows && rows[0] ? rows[0] : {...signup, unsubscribed_at: now, wants_updates:false};
    await upsertResendContact(updated);
    return ok({ok:true, message:"You are unsubscribed. You can come back anytime."});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
