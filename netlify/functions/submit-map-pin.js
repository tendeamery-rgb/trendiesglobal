const {ok, clean, eventHeaders, parseJSONBody, ipHash, supabase} = require("./common");
exports.handler = async (event) => {
  if(event.httpMethod==="OPTIONS") return ok({ok:true});
  if(event.httpMethod!=="POST") return ok({ok:false,error:"Method not allowed"},405);
  try{
    const parsed = parseJSONBody(event);
    if(parsed.error) return parsed.error;
    const b = parsed.body;
    const country = clean(b.country,120);
    const flag = clean(b.flag || "📍",8);
    if(!country) return ok({ok:false,error:"Country required"},400);
    await supabase("trendies_country_pins",{method:"POST",body:JSON.stringify({country,country_normalized:country.toLowerCase(),flag,ip_hash:ipHash(event),user_agent:clean(eventHeaders(event)["user-agent"],500)})});
    const rows = await supabase(`trendies_country_pin_counts?country_normalized=eq.${encodeURIComponent(country.toLowerCase())}&select=count&limit=1`,{method:"GET"});
    return ok({ok:true,pin:{country,flag,count:Number(rows && rows[0] ? rows[0].count : 1)}});
  }catch(e){ console.error(e); return ok({ok:false,error:e.message},500); }
};
