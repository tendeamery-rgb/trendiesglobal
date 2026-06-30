const {ok, supabase} = require("./common");
exports.handler = async () => {
  try{
    const rows = await supabase("trendies_wall_notes?status=eq.approved&select=id,note_censored,country,category,vibe,created_at&order=created_at.desc&limit=12",{method:"GET"});
    return ok((rows||[]).map(r=>({id:r.id,note:r.note_censored,country:r.country,category:r.category||r.vibe||"wall"})));
  }catch(e){ return ok([]); }
};