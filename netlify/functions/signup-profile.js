const {ok, supabase, siteUrl} = require("./common");
const {referralLink} = require("./email-helpers");

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  const token = event.queryStringParameters && event.queryStringParameters.token;
  if(!token) return ok({ok:false,error:"Missing token"},401);

  try{
    const rows = await supabase(`trendies_interest_responses?unsubscribe_token=eq.${encodeURIComponent(token)}&select=id,first_name,full_name,city,country,email_preferences,wants_updates,unsubscribed_at,referral_code,welcome_email_sent_at&limit=1`, {method:"GET"});
    const row = rows && rows[0];
    if(!row) return ok({ok:false,error:"Signup not found"},404);
    return ok({
      ok:true,
      first_name: row.first_name || "there",
      full_name: row.full_name || "",
      city: row.city || "",
      country: row.country || "",
      wants_updates: !!row.wants_updates,
      unsubscribed: !!row.unsubscribed_at,
      email_preferences: row.email_preferences || {},
      referral_code: row.referral_code || "",
      referral_link: referralLink(row.referral_code),
      home_url: siteUrl(),
      welcome_email_sent: !!row.welcome_email_sent_at
    });
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
