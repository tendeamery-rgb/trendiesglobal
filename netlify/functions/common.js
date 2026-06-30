const crypto = require("crypto");
const headers = {"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
const ok = (body, code=200) => ({statusCode:code, headers, body:JSON.stringify(body)});
function clean(v, n=1000){ return String(v||"").trim().replace(/\s+/g," ").slice(0,n); }
function escapeHTML(v){ return String(v ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function eventHeaders(event){ return event && event.headers ? event.headers : {}; }
function ipHash(event){ const h = eventHeaders(event); const ip = h["x-nf-client-connection-ip"] || h["x-forwarded-for"] || ""; return crypto.createHash("sha256").update(ip + ":" + (process.env.APPROVAL_SECRET || "trendies")).digest("hex"); }
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
async function sendEmail(subject, html, options={}){
  const required = !!options.required;
  const to = process.env.APPROVAL_EMAIL || "tende.amery@gmail.com";
  const from = process.env.EMAIL_FROM || "";
  if(!process.env.RESEND_API_KEY || !from) {
    const message = !process.env.RESEND_API_KEY ? "RESEND_API_KEY env var missing" : "EMAIL_FROM env var missing";
    if(required) throw new Error(message);
    console.error(message);
    return {sent:false};
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.EMAIL_TIMEOUT_MS || 8000));
  let res;
  try{
    res = await fetch("https://api.resend.com/emails", {method:"POST", signal:controller.signal, headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,"Content-Type":"application/json"}, body:JSON.stringify({from, to, subject, html})});
  }finally{
    clearTimeout(timeout);
  }
  if(!res.ok) {
    const message = `Resend email failed: ${res.status} ${await res.text()}`;
    if(required) throw new Error(message);
    console.error(message);
    return {sent:false};
  }
  return {sent:true};
}
module.exports = {headers, ok, clean, escapeHTML, eventHeaders, parseJSONBody, ipHash, supabase, sendEmail};
