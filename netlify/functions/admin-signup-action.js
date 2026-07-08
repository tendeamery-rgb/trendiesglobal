const {adminEmail, ok, parseJSONBody, randomToken, rateLimit, requireAdmin, supabase} = require("./common");
const {sendWelcomeEmail} = require("./email-helpers");

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
    if(!rateLimit(event, "admin-signup-action", 40, 60000)) return ok({ok:false,error:"Too many admin requests. Please wait a moment."},429);
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const body = parsed.body || {};
    if(!requireAdmin(event, body)) return ok({ok:false,error:"Missing or incorrect admin password"},401);

    if(body.action === "test_onboarding") {
      const result = await sendWelcomeEmail({
        id: null,
        email: adminEmail(),
        first_name: "Tende",
        full_name: "Tende",
        name: "Tende",
        unsubscribe_token: randomToken(12),
        referral_code: "TESTCHAPTER"
      }, {required:true});
      return ok({ok:true, sent:true, resend_email_id: result.id || null});
    }

    if(body.action !== "resend_welcome") return ok({ok:false,error:"Unknown action"},400);
    if(!body.id) return ok({ok:false,error:"Missing signup id"},400);

    const rows = await supabase(`trendies_interest_responses?id=eq.${encodeURIComponent(body.id)}&select=*&limit=1`, {method:"GET"});
    const signup = rows && rows[0];
    if(!signup) return ok({ok:false,error:"Signup not found"},404);
    if(!signup.wants_updates || signup.unsubscribed_at) return ok({ok:false,error:"This person is not eligible for welcome email."},400);

    const result = await sendWelcomeEmail(signup);
    await supabase(`trendies_interest_responses?id=eq.${encodeURIComponent(signup.id)}`, {
      method:"PATCH",
      body: JSON.stringify({
        welcome_email_sent_at: result.sent ? new Date().toISOString() : signup.welcome_email_sent_at,
        welcome_email_last_error: result.error || "",
        updated_at: new Date().toISOString()
      })
    });
    await logDelivery({
      campaign_id: null,
      recipient_email: signup.email,
      recipient_user_id: signup.id,
      resend_email_id: result.id || null,
      status: result.sent ? "sent" : "failed",
      error_message: result.error || "",
      sent_at: new Date().toISOString()
    });
    return ok({ok:true, sent:!!result.sent, error:result.error || "", resend_email_id: result.id || null});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
