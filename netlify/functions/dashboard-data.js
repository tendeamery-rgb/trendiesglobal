const {ok, supabase} = require("./common");

function requireToken(event){
  const supplied = (event.queryStringParameters && event.queryStringParameters.token) || "";
  const secret = process.env.EXPORT_SECRET || "";
  return secret && supplied && supplied === secret;
}

async function breakdown(view, limit=20){
  return await supabase(`${view}?select=label,count&order=count.desc&limit=${limit}`,{method:"GET"});
}

async function viewRows(view, select="*", limit=20){
  return await supabase(`${view}?select=${select}&order=count.desc&limit=${limit}`,{method:"GET"});
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(!requireToken(event)) return ok({ok:false,error:"Missing or incorrect dashboard token"},401);

  try{
    const [
      totalsRows,
      interests,
      notes,
      countryPins,
      region,
      respondentType,
      partnershipType,
      intentStrength,
      activityTags,
      safetyTags,
      countries,
      cities,
      helperTypes,
      optIns,
      referrals,
      partnerSupportTypes,
      partnerEnquiries
    ] = await Promise.all([
      supabase("trendies_dashboard_totals?select=*&limit=1",{method:"GET"}),
      supabase("trendies_interest_responses?select=*&order=created_at.desc&limit=500",{method:"GET"}),
      supabase("trendies_wall_notes?select=*&order=created_at.desc&limit=50",{method:"GET"}),
      supabase("trendies_country_pin_counts?select=country,country_normalized,flag,count&order=count.desc&limit=1000",{method:"GET"}),
      breakdown("trendies_interest_region_counts"),
      breakdown("trendies_interest_respondent_type_counts"),
      breakdown("trendies_interest_partnership_type_counts"),
      breakdown("trendies_interest_intent_strength_counts"),
      breakdown("trendies_interest_activity_tag_counts"),
      breakdown("trendies_interest_safety_tag_counts"),
      breakdown("trendies_interest_country_counts"),
      viewRows("trendies_interest_city_breakdown", "label,country,count", 40),
      breakdown("trendies_interest_helper_type_counts"),
      breakdown("trendies_interest_opt_in_counts"),
      breakdown("trendies_referral_counts"),
      breakdown("trendies_partner_support_type_counts"),
      supabase("trendies_partner_enquiries?select=*&order=created_at.desc&limit=80",{method:"GET"})
    ]);

    const totals = totalsRows && totalsRows[0] ? totalsRows[0] : {
      interests: interests.length,
      wall_notes: notes.length,
      country_pin_submissions: 0,
      countries_pinned: countryPins.length,
      partners_or_helpers: 0
    };

    const rows = (interests||[]).map(r => ({
      id: r.id,
      created_at: r.created_at,
      updated_at: r.updated_at,
      name: r.full_name || r.name,
      first_name: r.first_name,
      email: r.email,
      age: r.age,
      social: r.social_handle || r.social,
      city: r.city,
      country: r.country,
      region: r.region,
      respondent_type: r.respondent_type,
      partnership_type: r.partnership_type,
      intent_strength: r.intent_strength,
      helper_type: r.helper_type,
      activity_tags: r.activity_tags || [],
      safety_tags: r.safety_tags || [],
      categorisation_source: r.categorisation_source || "rules",
      ai_summary: r.ai_summary || "",
      ai_priority: r.ai_priority || "",
      ai_tags: r.ai_tags || [],
      wants_updates: r.wants_updates,
      confirmed_18_plus: r.confirmed_18_plus,
      unsubscribed_at: r.unsubscribed_at,
      welcome_email_sent_at: r.welcome_email_sent_at,
      welcome_email_last_error: r.welcome_email_last_error,
      referral_code: r.referral_code,
      referred_by: r.referred_by,
      show_up_reason: r.what_would_make_you_show_up || (r.answers && r.answers.show_up_reason),
      safety_needs: r.what_would_make_it_feel_safe || (r.answers && r.answers.safety_needs),
      help_build: r.helper_type || (r.answers && r.answers.help_build)
    }));

    const partners = (partnerEnquiries || []).map(p => ({
      id: p.id,
      created_at: p.created_at,
      name: p.name,
      email: p.email,
      organisation: p.organisation,
      role: p.role,
      city_country: p.city_country,
      support_type: p.support_type,
      status: p.status,
      message: p.message
    }));

    return ok({
      ok:true,
      refreshed_at:new Date().toISOString(),
      totals,
      breakdowns:{
        region,
        respondent_type: respondentType,
        partnership_type: partnershipType,
        intent_strength: intentStrength,
        activity_tags: activityTags,
        safety_tags: safetyTags,
        countries,
        cities,
        helper_types: helperTypes,
        opt_ins: optIns,
        referrals,
        partner_support_types: partnerSupportTypes
      },
      latest_interests: rows,
      latest_partner_enquiries: partners,
      latest_wall_notes: notes || [],
      country_pins: countryPins || []
    });
  }catch(e){
    console.error(e);
    return ok({ok:false,error:e.message},500);
  }
};
