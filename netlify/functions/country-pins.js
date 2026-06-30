const {ok, supabase} = require("./common");
exports.handler = async () => {
  try{
    const rows = await supabase("trendies_country_pin_counts?select=country,country_normalized,flag,count&order=count.desc&limit=1000",{method:"GET"});
    return ok({ok:true,pins:rows || []});
  }catch(e){ console.error(e); return ok({ok:false,pins:[],error:e.message},500); }
};
