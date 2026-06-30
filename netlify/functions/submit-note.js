const {ok, clean, escapeHTML, eventHeaders, parseJSONBody, ipHash, supabase, sendEmail} = require("./common");
exports.handler = async (event) => {
  if(event.httpMethod==="OPTIONS") return ok({ok:true});
  if(event.httpMethod!=="POST") return ok({ok:false,error:"Method not allowed"},405);
  try{
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const b = parsed.body;
    const note = clean(b.note,220);
    const country = clean(b.country,120);
    const category = clean(b.category || b.vibe || "wall",80);
    if(!note || !country) return ok({ok:false,error:"Note and country required"},400);
    const row = {note,note_censored:note,country,category,vibe:category,note_type:clean(b.note_type||"anonymous_wall",80),status:"pending",ip_hash:ipHash(event),user_agent:clean(eventHeaders(event)["user-agent"],500)};
    await supabase("trendies_wall_notes",{method:"POST",body:JSON.stringify(row)});
    await sendEmail(`Trendies wall note — ${category}`, `<h2>Wall note for review</h2><p>${escapeHTML(note)}</p><p>${escapeHTML(country)} / ${escapeHTML(category)}</p>`);
    return ok({ok:true});
  }catch(e){ console.error(e); return ok({ok:false,error:e.message},500); }
};
