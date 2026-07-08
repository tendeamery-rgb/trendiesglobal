const {ok, parseJSONBody, supabase} = require("./common");
const {emailPreferencesFromBody, upsertResendContact} = require("./email-helpers");

async function findByToken(token){
  const rows = await supabase(`trendies_interest_responses?unsubscribe_token=eq.${encodeURIComponent(token)}&select=*&limit=1`, {method:"GET"});
  return rows && rows[0] ? rows[0] : null;
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  const queryToken = event.queryStringParameters && event.queryStringParameters.token;

  try{
    if(event.httpMethod === "GET") {
      if(!queryToken) return ok({ok:false,error:"Missing token"},401);
      const signup = await findByToken(queryToken);
      if(!signup) return ok({ok:false,error:"Signup not found"},404);
      return ok({
        ok:true,
        first_name: signup.first_name || "there",
        wants_updates: !!signup.wants_updates,
        unsubscribed: !!signup.unsubscribed_at,
        email_preferences: signup.email_preferences || {}
      });
    }

    if(event.httpMethod !== "POST") return ok({ok:false,error:"Method not allowed"},405);
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const body = parsed.body || {};
    const token = body.token || queryToken;
    if(!token) return ok({ok:false,error:"Missing token"},401);
    const signup = await findByToken(token);
    if(!signup) return ok({ok:false,error:"Signup not found"},404);

    const prefs = emailPreferencesFromBody({email_preferences: body.email_preferences || body});
    const wantsUpdates = Object.values(prefs).some(Boolean);
    const rows = await supabase(`trendies_interest_responses?id=eq.${encodeURIComponent(signup.id)}`, {
      method:"PATCH",
      body: JSON.stringify({
        email_preferences: prefs,
        wants_updates: wantsUpdates,
        unsubscribed_at: wantsUpdates ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    });
    const updated = rows && rows[0] ? rows[0] : {...signup, email_preferences:prefs, wants_updates:wantsUpdates};
    await upsertResendContact(updated);
    return ok({ok:true, email_preferences:prefs, wants_updates:wantsUpdates, unsubscribed: !wantsUpdates});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
