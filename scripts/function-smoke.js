const assert = require("assert");

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
process.env.RESEND_API_KEY = "resend-test-key";
process.env.EMAIL_FROM = "Trendies Global <hello@trendiesglobal.com>";
process.env.APPROVAL_EMAIL = "tende.amery@gmail.com";
process.env.APPROVAL_SECRET = "approval-secret";
process.env.EXPORT_SECRET = "owner-secret";
process.env.ADMIN_SECRET = "owner-secret";
process.env.SITE_URL = "https://trendiesglobal.com";
delete process.env.OPENAI_API_KEY;

const calls = [];
global.fetch = async (url, options = {}) => {
  calls.push({url: String(url), options});

  if(String(url).includes("/rest/v1/trendies_interest_responses") && options.method === "GET" && String(url).includes("email_normalized=eq.")) {
    return response([]);
  }
  if(String(url).includes("/rest/v1/trendies_interest_responses") && options.method === "GET" && String(url).includes("email=eq.")) {
    return response([]);
  }
  if(String(url).includes("/rest/v1/trendies_interest_responses") && options.method === "POST") {
    const body = JSON.parse(options.body || "{}");
    return response([{id:"interest-1", ...body}]);
  }
  if(String(url).includes("/rest/v1/trendies_interest_responses") && options.method === "PATCH") {
    const body = JSON.parse(options.body || "{}");
    return response([{id:"interest-1", ...body}]);
  }
  if(String(url).includes("/rest/v1/trendies_email_deliveries") && options.method === "POST") {
    return response([{id:"delivery-1"}]);
  }
  if(String(url).includes("/rest/v1/trendies_partner_enquiries") && options.method === "POST") {
    return response([{id:"partner-1"}]);
  }
  if(String(url).includes("/rest/v1/trendies_wall_notes") && options.method === "POST") {
    return response([{id:"note-1"}]);
  }
  if(String(url).includes("/rest/v1/trendies_dashboard_totals")) {
    return response([{interests:1, email_opt_ins:1, confirmed_18_plus:1, unsubscribed:0, wall_notes:1, country_pin_submissions:2, countries_pinned:1, partners_or_helpers:1, partner_enquiries:1}]);
  }
  if(String(url).includes("/rest/v1/trendies_interest_responses") && options.method === "GET") {
    return response([{
      id:"interest-1",
      created_at:"2026-06-29T10:00:00Z",
      updated_at:"2026-06-29T10:00:01Z",
      name:"A Test",
      full_name:"A Test",
      first_name:"A",
      email:"test@example.com",
      email_normalized:"test@example.com",
      age:22,
      social:"@test",
      social_handle:"@test",
      city:"London",
      country:"United Kingdom",
      region:"UK / Europe",
      respondent_type:"creative collaborator",
      partnership_type:"creative",
      intent_strength:"strong",
      helper_type:"I am a photographer/filmmaker/creative",
      activity_tags:["picnics / park plans","short films / creator moments"],
      safety_tags:["daylight","public place"],
      categorisation_source:"rules",
      ai_summary:"",
      ai_priority:"",
      ai_tags:[],
      wants_updates:true,
      confirmed_18_plus:true,
      referral_code:"TESTCHAPTER",
      referred_by:"",
      unsubscribe_token:"token-1",
      welcome_email_sent_at:"2026-06-29T10:00:05Z",
      unsubscribed_at:null,
      what_would_make_you_show_up:"Picnic and short films",
      what_would_make_it_feel_safe:"Daylight public place",
      answers:{show_up_reason:"Picnic and short films", safety_needs:"Daylight public place", help_build:"I am a photographer"}
    }]);
  }
  if(String(url).includes("/rest/v1/trendies_partner_enquiries") && options.method === "GET") {
    return response([{id:"partner-1", created_at:"2026-06-29T10:12:00Z", name:"Partner Person", email:"partner@example.com", organisation:"Venue", role:"Owner", city_country:"London, UK", support_type:"Venue / space", status:"new", message:"We can host."}]);
  }
  if(String(url).includes("/rest/v1/trendies_wall_notes") && options.method === "GET") {
    return response([{created_at:"2026-06-29T10:10:00Z", note:"Summer please", note_censored:"Summer please", country:"United Kingdom", category:"friendship", status:"pending"}]);
  }
  if(String(url).includes("/rest/v1/trendies_country_pin_counts")) {
    return response([{country:"United Kingdom", country_normalized:"united kingdom", flag:"GB", count:2}]);
  }
  if(String(url).includes("/rest/v1/trendies_interest_")) {
    return response([{label:"Test", count:1}]);
  }
  if(String(url).includes("/rest/v1/trendies_referral_counts")) {
    return response([{label:"TESTCHAPTER", count:1}]);
  }
  if(String(url).includes("/rest/v1/trendies_partner_support_type_counts")) {
    return response([{label:"Venue / space", count:1}]);
  }
  if(String(url) === "https://api.resend.com/contacts/test%40example.com" && options.method === "PATCH") {
    return response({message:"not found"}, 404);
  }
  if(String(url) === "https://api.resend.com/contacts" && options.method === "POST") {
    return response({id:"contact-1"});
  }
  if(String(url) === "https://api.resend.com/emails") {
    return response({id:"email-1"});
  }

  return response({error:"Unhandled smoke URL " + url}, 404);
};

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body
  };
}

function event(method, body, token) {
  return {
    httpMethod: method,
    body: body ? JSON.stringify(body) : "",
    headers: {"user-agent":"function-smoke-test", "x-nf-client-connection-ip":"127.0.0.1"},
    queryStringParameters: token ? {token} : {}
  };
}

async function run() {
  const {handler: submitInterest} = require("../netlify/functions/submit-interest");
  const {handler: submitNote} = require("../netlify/functions/submit-note");
  const {handler: submitPartner} = require("../netlify/functions/submit-partner-enquiry");
  const {handler: dashboardData} = require("../netlify/functions/dashboard-data");
  const {handler: exportInterests} = require("../netlify/functions/export-interests");

  const interest = await submitInterest(event("POST", {
    name:"A Test",
    email:"test@example.com",
    age:"22",
    social:"@test",
    city:"London",
    country:"United Kingdom",
    show_up_reason:"I would come for a picnic and short films",
    safety_needs:"Daylight public place",
    help_build:"I am a photographer/filmmaker/creative",
    updates_permission:"on",
    confirm_18:"on",
    referred_by:"FRIENDCODE"
  }));
  assert.equal(interest.statusCode, 200);
  const interestBody = JSON.parse(interest.body);
  assert.equal(interestBody.ok, true);
  assert.equal(interestBody.categories.region, "UK / Europe");
  assert.equal(interestBody.categories.respondent_type, "creative collaborator");

  const savedInterest = calls.find(c => c.url.includes("/trendies_interest_responses") && c.options.method === "POST");
  assert(savedInterest, "interest signup should save to Supabase");
  const savedInterestBody = JSON.parse(savedInterest.options.body);
  assert.equal(savedInterestBody.email, "test@example.com");
  assert.equal(savedInterestBody.email_normalized, "test@example.com");
  assert.equal(savedInterestBody.confirmed_18_plus, true);
  assert.equal(savedInterestBody.referred_by, "FRIENDCODE");
  assert.deepEqual(savedInterestBody.activity_tags.includes("short films / creator moments"), true);
  assert.equal(savedInterestBody.categorisation_source, "rules");

  const contactCreate = calls.find(c => c.url === "https://api.resend.com/contacts" && c.options.method === "POST");
  assert(contactCreate, "interest signup should sync a Resend contact");

  const welcomeEmail = calls.find(c => c.url === "https://api.resend.com/emails" && JSON.parse(c.options.body).to === "test@example.com");
  assert(welcomeEmail, "interest signup should send welcome email");

  const adminEmail = calls.find(c => c.url === "https://api.resend.com/emails" && JSON.parse(c.options.body).to === "tende.amery@gmail.com" && JSON.parse(c.options.body).subject.includes("NEW Trendies signup"));
  assert(adminEmail, "interest signup should send admin email");

  const note = await submitNote(event("POST", {note:"I want a safe picnic chapter", country:"United Kingdom", category:"friendship"}));
  assert.equal(note.statusCode, 200);
  const savedNote = calls.find(c => c.url.includes("/trendies_wall_notes") && c.options.method === "POST");
  assert(savedNote, "wall note should save to Supabase");
  assert.equal(JSON.parse(savedNote.options.body).status, "pending");

  const partner = await submitPartner(event("POST", {name:"Partner Person", email:"partner@example.com", organisation:"Venue", support_type:"Venue / space", message:"We can host."}));
  assert.equal(partner.statusCode, 200);
  const savedPartner = calls.find(c => c.url.includes("/trendies_partner_enquiries") && c.options.method === "POST");
  assert(savedPartner, "partner enquiry should save to Supabase");

  const blockedDashboard = await dashboardData(event("GET", null, "wrong-token"));
  assert.equal(blockedDashboard.statusCode, 401);

  const liveDashboard = await dashboardData(event("GET", null, "owner-secret"));
  assert.equal(liveDashboard.statusCode, 200);
  const dashboardBody = JSON.parse(liveDashboard.body);
  assert.equal(dashboardBody.ok, true);
  assert.equal(dashboardBody.latest_interests[0].respondent_type, "creative collaborator");
  assert.equal(dashboardBody.latest_interests[0].categorisation_source, "rules");
  assert.equal(dashboardBody.latest_partner_enquiries[0].support_type, "Venue / space");
  assert(dashboardBody.breakdowns.activity_tags.length);

  const csvExport = await exportInterests(event("GET", null, "owner-secret"));
  assert.equal(csvExport.statusCode, 200);
  assert(csvExport.body.includes("created_at,updated_at,first_name,full_name"));
  assert(csvExport.body.includes("creative collaborator"));

  console.log("Function smoke checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
