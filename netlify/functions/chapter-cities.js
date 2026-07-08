const {ok, supabase} = require("./common");

exports.handler = async (event) => {
  if(event.httpMethod === "OPTIONS") return ok({ok:true});
  if(event.httpMethod !== "GET") return ok({ok:false,error:"Method not allowed"},405);

  try{
    const rows = await supabase("trendies_interest_city_counts?select=city,country,count,top_activity,status&order=count.desc&limit=9", {method:"GET"});
    return ok({ok:true, cities: rows || []});
  }catch(error){
    console.error(error);
    return ok({ok:false,error:error.message},500);
  }
};
