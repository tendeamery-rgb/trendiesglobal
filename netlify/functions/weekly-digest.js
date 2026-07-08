const {adminEmail, escapeHTML, ok, requireAdmin, sendEmailTo, supabase} = require("./common");

exports.config = {schedule: "0 9 * * 1"};

function list(items, label="label"){
  return (items || []).slice(0, 8).map(item => `<li>${escapeHTML(item[label] || item.city || item.country || "Unknown")} — <b>${escapeHTML(item.count || 0)}</b></li>`).join("") || "<li>No data yet.</li>";
}

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  const enabled = String(process.env.WEEKLY_DIGEST_ENABLED || "false").toLowerCase() === "true";
  const manualAdmin = requireAdmin(event, {});
  if(!enabled && !manualAdmin) return ok({ok:true, skipped:true, reason:"Weekly digest disabled"});

  try{
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [
      totalsRows,
      newSignups,
      topCities,
      topCountries,
      partnerEnquiries,
      activities,
      safety,
      helpers
    ] = await Promise.all([
      supabase("trendies_dashboard_totals?select=*&limit=1", {method:"GET"}),
      supabase(`trendies_interest_responses?created_at=gte.${encodeURIComponent(since)}&select=id`, {method:"GET"}),
      supabase("trendies_interest_city_counts?select=city,country,count,top_activity,status&order=count.desc&limit=8", {method:"GET"}),
      supabase("trendies_interest_country_counts?select=label,count&order=count.desc&limit=8", {method:"GET"}),
      supabase(`trendies_partner_enquiries?created_at=gte.${encodeURIComponent(since)}&select=id,support_type`, {method:"GET"}),
      supabase("trendies_interest_activity_tag_counts?select=label,count&order=count.desc&limit=8", {method:"GET"}),
      supabase("trendies_interest_safety_tag_counts?select=label,count&order=count.desc&limit=8", {method:"GET"}),
      supabase("trendies_interest_responses?or=(respondent_type.ilike.*helper*,respondent_type.ilike.*creative*,partnership_type.neq.none)&select=id", {method:"GET"})
    ]);

    const totals = totalsRows && totalsRows[0] ? totalsRows[0] : {};
    const html = `<h1>Trendies weekly digest</h1>
      <p><b>New signups this week:</b> ${newSignups.length}</p>
      <p><b>Total signups:</b> ${totals.interests || 0}</p>
      <p><b>New partner enquiries:</b> ${partnerEnquiries.length}</p>
      <p><b>People willing to help / partner:</b> ${helpers.length}</p>
      <h2>Top cities</h2><ul>${list(topCities, "city")}</ul>
      <h2>Top countries</h2><ul>${list(topCountries)}</ul>
      <h2>Requested activities</h2><ul>${list(activities)}</ul>
      <h2>Safety signals</h2><ul>${list(safety)}</ul>`;

    const result = await sendEmailTo({
      to: adminEmail(),
      subject: "Trendies weekly growth digest",
      html,
      required: true
    });
    return ok({ok:true, sent:true, resend_email_id: result.id || null});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
