const crypto = require("crypto");
const headers = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const ok = (body, code=200) => ({statusCode:code, headers, body:JSON.stringify(body)});
function clean(v, n=1000){ return String(v||"").trim().replace(/\s+/g," ").slice(0,n); }
function escapeHTML(v){ return String(v ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function eventHeaders(event){ return event && event.headers ? event.headers : {}; }
function ipHash(event){ const h = eventHeaders(event); const ip = h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || ""; return crypto.createHash("sha256").update(ip + ":" + (process.env.APPROVAL_SECRET || "trendies")).digest("hex"); }
function normalizeEmail(email){ return clean(email, 220).toLowerCase(); }
function isValidEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "")); }
function siteUrl(){ return (process.env.SITE_URL || "https://trendiesglobal.com").replace(/\/$/,""); }
function adminEmail(){ return process.env.TRENDIES_ADMIN_EMAIL || process.env.APPROVAL_EMAIL || "tende.amery@gmail.com"; }
function fromEmail(){ return process.env.TRENDIES_FROM_EMAIL || process.env.EMAIL_FROM || "Trendies Global <hello@trendiesglobal.com>"; }
function randomToken(bytes=24){ return crypto.randomBytes(bytes).toString("base64url"); }
function referralCode(seed=""){
  const raw = crypto.createHash("sha256").update(`${seed}:${Date.now()}:${randomToken(8)}`).digest("base64url");
  return raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
}
function parseJSONBody(event){
  try { return {body: JSON.parse((event && event.body) || "{}")}; }
  catch { return {error: ok({ok:false,error:"Invalid JSON"},400)}; }
}
async function supabase(path, options={}){
  if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase env vars missing");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${process.env.SUPABASE_URL.replace(/\/$/,"")}/rest/v1/${path}`, {...options, headers:{apikey:key, Authorization:`Bearer ${key}`, "Content-Type":"application/json", Prefer:"return=representation", ...(options.headers||{})}});
  const text = await res.text(); let data = null; try{ data = text ? JSON.parse(text) : null }catch{ data = text }
  if(!res.ok) throw new Error(typeof data==="string" ? data : JSON.stringify(data));
  return data;
}
const rateStore = new Map();
function rateLimit(event, key, limit=8, windowMs=60000){
  const h = eventHeaders(event);
  const ip = h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || "unknown";
  const bucket = `${key}:${crypto.createHash("sha256").update(ip).digest("hex").slice(0,18)}`;
  const now = Date.now();
  const current = rateStore.get(bucket) || {count:0, reset: now + windowMs};
  if(now > current.reset){
    current.count = 0;
    current.reset = now + windowMs;
  }
  current.count += 1;
  rateStore.set(bucket, current);
  return current.count <= limit;
}
function requireAdmin(event, body={}){
  const h = eventHeaders(event);
  const supplied = body.admin_secret
    || body.admin_password
    || h["x-admin-secret"]
    || (event.queryStringParameters && (event.queryStringParameters.admin_secret || event.queryStringParameters.token))
    || "";
  const secret = process.env.ADMIN_SECRET || process.env.TRENDIES_ADMIN_PASSWORD || process.env.EXPORT_SECRET || "";
  return !!secret && supplied === secret;
}
async function resendRequest(path, options={}){
  if(!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY env var missing");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.EMAIL_TIMEOUT_MS || 10000));
  try{
    const res = await fetch(`https://api.resend.com/${path.replace(/^\//,"")}`, {
      method: options.method || "GET",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await res.text();
    let data = null;
    try{ data = text ? JSON.parse(text) : null; }catch{ data = text; }
    if(!res.ok) {
      const message = typeof data === "string" ? data : (data && data.message) || (data && data.error && data.error.message) || JSON.stringify(data);
      const error = new Error(`Resend API failed: ${res.status} ${message}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  }finally{
    clearTimeout(timeout);
  }
}
async function sendEmailTo({to, subject, html, text, previewText, required=false}){
  const from = fromEmail();
  if(!process.env.RESEND_API_KEY || !from) {
    const message = !process.env.RESEND_API_KEY ? "RESEND_API_KEY env var missing" : "TRENDIES_FROM_EMAIL or EMAIL_FROM env var missing";
    if(required) throw new Error(message);
    console.error(message);
    return {sent:false, error:message};
  }
  try{
    const data = await resendRequest("emails", {
      method: "POST",
      body: {from, to, subject, html, text}
    });
    return {sent:true, id:data && data.id};
  }catch(error){
    if(required) throw error;
    console.error(error.message);
    return {sent:false, error:error.message};
  }
}
async function sendBatchEmails(messages, required=false){
  if(!messages.length) return {sent:false, data:[]};
  try{
    const data = await resendRequest("emails/batch", {method:"POST", body: messages});
    return {sent:true, data: data && data.data ? data.data : data};
  }catch(error){
    if(required) throw error;
    console.error(error.message);
    return {sent:false, error:error.message, data:[]};
  }
}
async function sendEmail(subject, html, options={}){
  return sendEmailTo({
    to: options.to || adminEmail(),
    subject,
    html,
    text: options.text,
    required: !!options.required
  });
}
module.exports = {
  headers,
  ok,
  clean,
  escapeHTML,
  eventHeaders,
  parseJSONBody,
  ipHash,
  normalizeEmail,
  isValidEmail,
  siteUrl,
  adminEmail,
  fromEmail,
  randomToken,
  referralCode,
  supabase,
  rateLimit,
  requireAdmin,
  resendRequest,
  sendEmailTo,
  sendBatchEmails,
  sendEmail
};
