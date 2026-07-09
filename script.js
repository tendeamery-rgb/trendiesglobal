const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

function text(el, value){
  if(el && value !== undefined && value !== null) el.textContent = value;
}

function image(el, item){
  if(!el || !item) return;
  if(item.src) el.src = item.src;
  if(item.alt) el.alt = item.alt;
}

$("#themeToggle")?.addEventListener("click", () => {
  document.body.classList.toggle("night");
  $("#themeToggle").textContent = document.body.classList.contains("night") ? "Day" : "Night";
});

function updateFloatingJoin(){
  document.body.classList.toggle("show-floating", window.scrollY > 520);
}
window.addEventListener("scroll", updateFloatingJoin, {passive:true});
updateFloatingJoin();

function setStatus(id, msg, error=false){
  const el = $(id);
  if(!el) return;
  el.textContent = msg;
  el.style.color = error ? "#a33" : "";
}

function escapeHTML(v){
  return String(v ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
}

function apiCandidates(url){
  const clean = String(url || "").replace(/^https?:\/\/[^/]+/,"");
  if(clean.startsWith("/api/")){
    const name = clean.replace("/api/","");
    return [clean, `/.netlify/functions/${name}`];
  }
  return [clean];
}

function explainFetchFailure(url, error){
  if(location.protocol === "file:"){
    return "This form cannot submit from a local file preview. Upload/deploy to Netlify, then test on the live https:// site.";
  }
  return `Could not reach the live backend for ${url}. On Netlify, check that Functions are deployed and the /api redirect exists.`;
}

const urlParams = new URLSearchParams(location.search);
const referralCode = urlParams.get("ref") || "";
if($("#referralSource")) $("#referralSource").value = referralCode;

async function postJSON(url, data){
  let lastError;
  for(const candidate of apiCandidates(url)){
    try{
      const res = await fetch(candidate, {
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify(data)
      });
      const json = await res.json().catch(()=>({}));
      if(!res.ok || json.ok === false) throw new Error(json.error || `Backend returned ${res.status}`);
      return json;
    }catch(error){
      lastError = error;
      // Try the next endpoint, e.g. /api/name then /.netlify/functions/name.
      continue;
    }
  }
  throw new Error(explainFetchFailure(url, lastError));
}

async function getJSON(url){
  let lastError;
  for(const candidate of apiCandidates(url)){
    try{
      const res = await fetch(candidate, {headers:{"Accept":"application/json"}});
      if(!res.ok) throw new Error(`Backend returned ${res.status}`);
      return await res.json();
    }catch(error){
      lastError = error;
      continue;
    }
  }
  throw new Error(explainFetchFailure(url, lastError));
}

async function loadEditableContent(){
  try{
    const res = await fetch("/data/site-content.json");
    if(!res.ok) return;
    const data = await res.json();

    text($(".hero .kicker"), data.hero?.kicker);
    text($(".hero h1"), data.hero?.title);
    text($(".hero .lede"), data.hero?.lede);
    const proof = $$(".quick-proof span");
    (data.hero?.proof_points || []).slice(0, proof.length).forEach((point, i) => text(proof[i], point));
    image($(".main-photo img"), data.hero?.images?.main);
    text($(".main-photo figcaption"), data.hero?.images?.main?.caption);
    image($(".hero-photo.small.one img"), data.hero?.images?.side_one);
    text($(".hero-photo.small.one figcaption"), data.hero?.images?.side_one?.caption);
    image($(".hero-photo.small.two img"), data.hero?.images?.side_two);
    text($(".hero-photo.small.two figcaption"), data.hero?.images?.side_two?.caption);
    image($(".hero-photo.small.three img"), data.hero?.images?.side_three);
    text($(".hero-photo.small.three figcaption"), data.hero?.images?.side_three?.caption);

    $$(".hub-card").forEach((card, i) => {
      const item = data.hub_cards?.[i];
      text($("strong", card), item?.title);
      if(!$("small", card)?.id) text($("small", card), item?.body);
    });

    text($(".vision-copy .kicker"), data.vision?.kicker);
    text($(".vision-copy h2"), data.vision?.title);
    $$(".vision-copy p:not(.kicker)").forEach((p, i) => text(p, data.vision?.paragraphs?.[i]));
    $$(".what-could-happen article").forEach((card, i) => {
      const item = data.vision?.cards?.[i];
      text($("strong", card), item?.title);
      text($("p", card), item?.body);
    });

    text($("#join .kicker"), data.join?.kicker);
    text($("#join h2"), data.join?.title);
    text($("#join .section-head > p:not(.kicker):not(.data-note-v61)"), data.join?.body);
    text($(".data-note-v61"), data.join?.data_note);

    text($("#guide .kicker"), data.guide?.kicker);
    text($("#guide h2"), data.guide?.title);
    text($("#guide .field-guide-copy p:not(.kicker)"), data.guide?.body);
    $$("#guide a[href*='instagram.com']").forEach(a => {
      if(data.guide?.instagram_channel) a.href = data.guide.instagram_channel;
    });
    $$(".guide-steps article").forEach((card, i) => {
      const item = data.guide?.steps?.[i];
      text($("strong", card), item?.title);
      text($("p", card), item?.body);
    });

    text($("#map .kicker"), data.map?.kicker);
    text($("#map h2"), data.map?.title);
    text($("#map .section-head p:not(.kicker)"), data.map?.body);

    text($("#wall .kicker"), data.wall?.kicker);
    text($("#wall h2"), data.wall?.title);
    text($("#wall .section-head p:not(.kicker)"), data.wall?.body);
    $$("[data-wall-prompt]").forEach((button, i) => {
      const prompt = data.wall?.prompts?.[i];
      if(prompt) button.dataset.wallPrompt = prompt;
    });

    text($(".story-copy .kicker"), data.story?.kicker);
    text($(".story-copy h2"), data.story?.title);
    $$(".story-copy p:not(.kicker)").forEach((p, i) => text(p, data.story?.paragraphs?.[i]));
    $$(".story-grid figure").forEach((figure, i) => {
      const item = data.story?.images?.[i];
      image($("img", figure), item);
      text($("figcaption", figure), item?.caption);
    });

    text($("#partners .kicker"), data.partners?.kicker);
    text($("#partners h2"), data.partners?.title);
    text($("#partners > div:first-child p:not(.kicker)"), data.partners?.body);
    $$(".partner-cards article").forEach((card, i) => {
      const item = data.partners?.cards?.[i];
      text($("strong", card), item?.title);
      text($("span", card), item?.body);
    });
    updateMapCount();
  }catch(e){}
}

async function loadBlogPosts(){
  try{
    const res = await fetch("/data/blog-posts.json");
    if(!res.ok) return;
    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts.slice(0, 3) : [];
    if(!posts.length || !$("#blogGrid")) return;
    $("#blogGrid").innerHTML = posts.map(post => `
      <article class="blog-card">
        <img alt="${escapeHTML(post.alt || post.title || "Trendies chapter note")}" loading="lazy" src="${escapeHTML(post.image || "assets/picnic-selfie.jpg")}"/>
        <div><span>${escapeHTML(post.category || "Chapter note")}</span><strong>${escapeHTML(post.title || "")}</strong><p>${escapeHTML(post.excerpt || "")}</p></div>
      </article>`).join("");
  }catch(e){}
}

$("#interestForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  const button = $("button[type='submit']", form);
  const data = Object.fromEntries(new FormData(form).entries());
  if(data.website) return;
  data.referred_by = data.referred_by || referralCode;
  data.signup_source = data.signup_source || "website_interest_form";
  setStatus("#interestStatus","Submitting to the live Trendies backend...");
  if(button) button.disabled = true;
  try{
    const result = await postJSON("/api/submit-interest", data);
    form.reset();
    setStatus("#interestStatus", result.message || "Done — you’re in Chapter One. Taking you to the welcome page...");
    if(result.redirect_url) window.location.href = result.redirect_url;
  }catch(err){
    setStatus("#interestStatus", err.message || "Could not submit yet.", true);
  }finally{
    if(button) button.disabled = false;
  }
});

$("#partnerForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  const button = $("button[type='submit']", form);
  const data = Object.fromEntries(new FormData(form).entries());
  if(data.website) return;
  setStatus("#partnerStatus","Sending partner enquiry...");
  if(button) button.disabled = true;
  try{
    await postJSON("/api/submit-partner-enquiry", data);
    form.reset();
    setStatus("#partnerStatus","Sent — thank you. This has been saved to the Trendies dashboard.");
  }catch(err){
    setStatus("#partnerStatus", err.message || "Could not send yet.", true);
  }finally{
    if(button) button.disabled = false;
  }
});

$("#wallForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  const button = $("button[type='submit']", form);
  const data = Object.fromEntries(new FormData(form).entries());
  data.note_type = "anonymous_wall";
  setStatus("#wallStatus","Sending for review...");
  if(button) button.disabled = true;
  try{
    await postJSON("/api/submit-note", data);
    form.reset();
    setStatus("#wallStatus","Sent for review.");
  }catch(err){
    setStatus("#wallStatus", err.message || "Could not submit yet.", true);
  }finally{
    if(button) button.disabled = false;
  }
});

$$("[data-wall-prompt]").forEach(button => {
  button.addEventListener("click", () => {
    const note = $("#wallForm textarea[name='note']");
    if(!note) return;
    note.value = button.dataset.wallPrompt || button.textContent.trim();
    note.focus();
  });
});

const countries = [["United Kingdom", "🇬🇧", 48, 34, 57], ["United States", "🇺🇸", 24, 43, 54], ["India", "🇮🇳", 69, 48, 51], ["Brazil", "🇧🇷", 33, 70, 47], ["South Korea", "🇰🇷", 83, 43, 43], ["Uganda", "🇺🇬", 54, 52, 39], ["Kenya", "🇰🇪", 57, 56, 36], ["Nigeria", "🇳🇬", 50, 56, 33], ["France", "🇫🇷", 49, 38, 31], ["Japan", "🇯🇵", 87, 42, 28], ["South Africa", "🇿🇦", 53, 76, 25], ["Spain", "🇪🇸", 46, 42, 23], ["Italy", "🇮🇹", 52, 42, 22], ["Australia", "🇦🇺", 82, 78, 20], ["Indonesia", "🇮🇩", 79, 64, 18], ["Germany", "🇩🇪", 51, 35, 17], ["Canada", "🇨🇦", 22, 30, 16], ["Morocco", "🇲🇦", 46, 48, 15], ["Thailand", "🇹🇭", 74, 55, 14], ["Mexico", "🇲🇽", 20, 55, 13], ["Singapore", "🇸🇬", 76, 62, 12], ["Philippines", "🇵🇭", 83, 56, 11], ["Netherlands", "🇳🇱", 50, 34, 10], ["China", "🇨🇳", 76, 40, 9], ["Pakistan", "🇵🇰", 66, 47, 7], ["Ghana", "🇬🇭", 47, 56, 6], ["United Arab Emirates", "🇦🇪", 63, 49, 5], ["Ireland", "🇮🇪", 45, 31, 4]];
const allCountries = [{"country": "Afghanistan", "code": "AF", "flag": "🇦🇫"}, {"country": "Albania", "code": "AL", "flag": "🇦🇱"}, {"country": "Algeria", "code": "DZ", "flag": "🇩🇿"}, {"country": "American Samoa", "code": "AS", "flag": "🇦🇸"}, {"country": "Andorra", "code": "AD", "flag": "🇦🇩"}, {"country": "Angola", "code": "AO", "flag": "🇦🇴"}, {"country": "Anguilla", "code": "AI", "flag": "🇦🇮"}, {"country": "Antarctica", "code": "AQ", "flag": "🇦🇶"}, {"country": "Antigua and Barbuda", "code": "AG", "flag": "🇦🇬"}, {"country": "Argentina", "code": "AR", "flag": "🇦🇷"}, {"country": "Armenia", "code": "AM", "flag": "🇦🇲"}, {"country": "Aruba", "code": "AW", "flag": "🇦🇼"}, {"country": "Australia", "code": "AU", "flag": "🇦🇺"}, {"country": "Austria", "code": "AT", "flag": "🇦🇹"}, {"country": "Azerbaijan", "code": "AZ", "flag": "🇦🇿"}, {"country": "Bahamas", "code": "BS", "flag": "🇧🇸"}, {"country": "Bahrain", "code": "BH", "flag": "🇧🇭"}, {"country": "Bangladesh", "code": "BD", "flag": "🇧🇩"}, {"country": "Barbados", "code": "BB", "flag": "🇧🇧"}, {"country": "Belarus", "code": "BY", "flag": "🇧🇾"}, {"country": "Belgium", "code": "BE", "flag": "🇧🇪"}, {"country": "Belize", "code": "BZ", "flag": "🇧🇿"}, {"country": "Benin", "code": "BJ", "flag": "🇧🇯"}, {"country": "Bermuda", "code": "BM", "flag": "🇧🇲"}, {"country": "Bhutan", "code": "BT", "flag": "🇧🇹"}, {"country": "Bolivia", "code": "BO", "flag": "🇧🇴"}, {"country": "Bonaire, Sint Eustatius and Saba", "code": "BQ", "flag": "🇧🇶"}, {"country": "Bosnia and Herzegovina", "code": "BA", "flag": "🇧🇦"}, {"country": "Botswana", "code": "BW", "flag": "🇧🇼"}, {"country": "Bouvet Island", "code": "BV", "flag": "🇧🇻"}, {"country": "Brazil", "code": "BR", "flag": "🇧🇷"}, {"country": "British Indian Ocean Territory", "code": "IO", "flag": "🇮🇴"}, {"country": "Brunei", "code": "BN", "flag": "🇧🇳"}, {"country": "Bulgaria", "code": "BG", "flag": "🇧🇬"}, {"country": "Burkina Faso", "code": "BF", "flag": "🇧🇫"}, {"country": "Burundi", "code": "BI", "flag": "🇧🇮"}, {"country": "Cabo Verde", "code": "CV", "flag": "🇨🇻"}, {"country": "Cambodia", "code": "KH", "flag": "🇰🇭"}, {"country": "Cameroon", "code": "CM", "flag": "🇨🇲"}, {"country": "Canada", "code": "CA", "flag": "🇨🇦"}, {"country": "Cayman Islands", "code": "KY", "flag": "🇰🇾"}, {"country": "Central African Republic", "code": "CF", "flag": "🇨🇫"}, {"country": "Chad", "code": "TD", "flag": "🇹🇩"}, {"country": "Chile", "code": "CL", "flag": "🇨🇱"}, {"country": "China", "code": "CN", "flag": "🇨🇳"}, {"country": "Christmas Island", "code": "CX", "flag": "🇨🇽"}, {"country": "Cocos (Keeling) Islands", "code": "CC", "flag": "🇨🇨"}, {"country": "Colombia", "code": "CO", "flag": "🇨🇴"}, {"country": "Comoros", "code": "KM", "flag": "🇰🇲"}, {"country": "Cook Islands", "code": "CK", "flag": "🇨🇰"}, {"country": "Costa Rica", "code": "CR", "flag": "🇨🇷"}, {"country": "Croatia", "code": "HR", "flag": "🇭🇷"}, {"country": "Cuba", "code": "CU", "flag": "🇨🇺"}, {"country": "Curaçao", "code": "CW", "flag": "🇨🇼"}, {"country": "Cyprus", "code": "CY", "flag": "🇨🇾"}, {"country": "Czechia", "code": "CZ", "flag": "🇨🇿"}, {"country": "Côte d'Ivoire", "code": "CI", "flag": "🇨🇮"}, {"country": "DR Congo", "code": "CD", "flag": "🇨🇩"}, {"country": "Denmark", "code": "DK", "flag": "🇩🇰"}, {"country": "Djibouti", "code": "DJ", "flag": "🇩🇯"}, {"country": "Dominica", "code": "DM", "flag": "🇩🇲"}, {"country": "Dominican Republic", "code": "DO", "flag": "🇩🇴"}, {"country": "Ecuador", "code": "EC", "flag": "🇪🇨"}, {"country": "Egypt", "code": "EG", "flag": "🇪🇬"}, {"country": "El Salvador", "code": "SV", "flag": "🇸🇻"}, {"country": "Equatorial Guinea", "code": "GQ", "flag": "🇬🇶"}, {"country": "Eritrea", "code": "ER", "flag": "🇪🇷"}, {"country": "Estonia", "code": "EE", "flag": "🇪🇪"}, {"country": "Eswatini", "code": "SZ", "flag": "🇸🇿"}, {"country": "Ethiopia", "code": "ET", "flag": "🇪🇹"}, {"country": "Falkland Islands (Malvinas)", "code": "FK", "flag": "🇫🇰"}, {"country": "Faroe Islands", "code": "FO", "flag": "🇫🇴"}, {"country": "Fiji", "code": "FJ", "flag": "🇫🇯"}, {"country": "Finland", "code": "FI", "flag": "🇫🇮"}, {"country": "France", "code": "FR", "flag": "🇫🇷"}, {"country": "French Guiana", "code": "GF", "flag": "🇬🇫"}, {"country": "French Polynesia", "code": "PF", "flag": "🇵🇫"}, {"country": "French Southern Territories", "code": "TF", "flag": "🇹🇫"}, {"country": "Gabon", "code": "GA", "flag": "🇬🇦"}, {"country": "Gambia", "code": "GM", "flag": "🇬🇲"}, {"country": "Georgia", "code": "GE", "flag": "🇬🇪"}, {"country": "Germany", "code": "DE", "flag": "🇩🇪"}, {"country": "Ghana", "code": "GH", "flag": "🇬🇭"}, {"country": "Gibraltar", "code": "GI", "flag": "🇬🇮"}, {"country": "Greece", "code": "GR", "flag": "🇬🇷"}, {"country": "Greenland", "code": "GL", "flag": "🇬🇱"}, {"country": "Grenada", "code": "GD", "flag": "🇬🇩"}, {"country": "Guadeloupe", "code": "GP", "flag": "🇬🇵"}, {"country": "Guam", "code": "GU", "flag": "🇬🇺"}, {"country": "Guatemala", "code": "GT", "flag": "🇬🇹"}, {"country": "Guernsey", "code": "GG", "flag": "🇬🇬"}, {"country": "Guinea", "code": "GN", "flag": "🇬🇳"}, {"country": "Guinea-Bissau", "code": "GW", "flag": "🇬🇼"}, {"country": "Guyana", "code": "GY", "flag": "🇬🇾"}, {"country": "Haiti", "code": "HT", "flag": "🇭🇹"}, {"country": "Heard Island and McDonald Islands", "code": "HM", "flag": "🇭🇲"}, {"country": "Honduras", "code": "HN", "flag": "🇭🇳"}, {"country": "Hong Kong", "code": "HK", "flag": "🇭🇰"}, {"country": "Hungary", "code": "HU", "flag": "🇭🇺"}, {"country": "Iceland", "code": "IS", "flag": "🇮🇸"}, {"country": "India", "code": "IN", "flag": "🇮🇳"}, {"country": "Indonesia", "code": "ID", "flag": "🇮🇩"}, {"country": "Iran", "code": "IR", "flag": "🇮🇷"}, {"country": "Iraq", "code": "IQ", "flag": "🇮🇶"}, {"country": "Ireland", "code": "IE", "flag": "🇮🇪"}, {"country": "Isle of Man", "code": "IM", "flag": "🇮🇲"}, {"country": "Israel", "code": "IL", "flag": "🇮🇱"}, {"country": "Italy", "code": "IT", "flag": "🇮🇹"}, {"country": "Jamaica", "code": "JM", "flag": "🇯🇲"}, {"country": "Japan", "code": "JP", "flag": "🇯🇵"}, {"country": "Jersey", "code": "JE", "flag": "🇯🇪"}, {"country": "Jordan", "code": "JO", "flag": "🇯🇴"}, {"country": "Kazakhstan", "code": "KZ", "flag": "🇰🇿"}, {"country": "Kenya", "code": "KE", "flag": "🇰🇪"}, {"country": "Kiribati", "code": "KI", "flag": "🇰🇮"}, {"country": "Kuwait", "code": "KW", "flag": "🇰🇼"}, {"country": "Kyrgyzstan", "code": "KG", "flag": "🇰🇬"}, {"country": "Laos", "code": "LA", "flag": "🇱🇦"}, {"country": "Latvia", "code": "LV", "flag": "🇱🇻"}, {"country": "Lebanon", "code": "LB", "flag": "🇱🇧"}, {"country": "Lesotho", "code": "LS", "flag": "🇱🇸"}, {"country": "Liberia", "code": "LR", "flag": "🇱🇷"}, {"country": "Libya", "code": "LY", "flag": "🇱🇾"}, {"country": "Liechtenstein", "code": "LI", "flag": "🇱🇮"}, {"country": "Lithuania", "code": "LT", "flag": "🇱🇹"}, {"country": "Luxembourg", "code": "LU", "flag": "🇱🇺"}, {"country": "Macao", "code": "MO", "flag": "🇲🇴"}, {"country": "Madagascar", "code": "MG", "flag": "🇲🇬"}, {"country": "Malawi", "code": "MW", "flag": "🇲🇼"}, {"country": "Malaysia", "code": "MY", "flag": "🇲🇾"}, {"country": "Maldives", "code": "MV", "flag": "🇲🇻"}, {"country": "Mali", "code": "ML", "flag": "🇲🇱"}, {"country": "Malta", "code": "MT", "flag": "🇲🇹"}, {"country": "Marshall Islands", "code": "MH", "flag": "🇲🇭"}, {"country": "Martinique", "code": "MQ", "flag": "🇲🇶"}, {"country": "Mauritania", "code": "MR", "flag": "🇲🇷"}, {"country": "Mauritius", "code": "MU", "flag": "🇲🇺"}, {"country": "Mayotte", "code": "YT", "flag": "🇾🇹"}, {"country": "Mexico", "code": "MX", "flag": "🇲🇽"}, {"country": "Micronesia, Federated States of", "code": "FM", "flag": "🇫🇲"}, {"country": "Moldova", "code": "MD", "flag": "🇲🇩"}, {"country": "Monaco", "code": "MC", "flag": "🇲🇨"}, {"country": "Mongolia", "code": "MN", "flag": "🇲🇳"}, {"country": "Montenegro", "code": "ME", "flag": "🇲🇪"}, {"country": "Montserrat", "code": "MS", "flag": "🇲🇸"}, {"country": "Morocco", "code": "MA", "flag": "🇲🇦"}, {"country": "Mozambique", "code": "MZ", "flag": "🇲🇿"}, {"country": "Myanmar", "code": "MM", "flag": "🇲🇲"}, {"country": "Namibia", "code": "NA", "flag": "🇳🇦"}, {"country": "Nauru", "code": "NR", "flag": "🇳🇷"}, {"country": "Nepal", "code": "NP", "flag": "🇳🇵"}, {"country": "Netherlands", "code": "NL", "flag": "🇳🇱"}, {"country": "New Caledonia", "code": "NC", "flag": "🇳🇨"}, {"country": "New Zealand", "code": "NZ", "flag": "🇳🇿"}, {"country": "Nicaragua", "code": "NI", "flag": "🇳🇮"}, {"country": "Niger", "code": "NE", "flag": "🇳🇪"}, {"country": "Nigeria", "code": "NG", "flag": "🇳🇬"}, {"country": "Niue", "code": "NU", "flag": "🇳🇺"}, {"country": "Norfolk Island", "code": "NF", "flag": "🇳🇫"}, {"country": "North Korea", "code": "KP", "flag": "🇰🇵"}, {"country": "North Macedonia", "code": "MK", "flag": "🇲🇰"}, {"country": "Northern Mariana Islands", "code": "MP", "flag": "🇲🇵"}, {"country": "Norway", "code": "NO", "flag": "🇳🇴"}, {"country": "Oman", "code": "OM", "flag": "🇴🇲"}, {"country": "Pakistan", "code": "PK", "flag": "🇵🇰"}, {"country": "Palau", "code": "PW", "flag": "🇵🇼"}, {"country": "Palestine", "code": "PS", "flag": "🇵🇸"}, {"country": "Panama", "code": "PA", "flag": "🇵🇦"}, {"country": "Papua New Guinea", "code": "PG", "flag": "🇵🇬"}, {"country": "Paraguay", "code": "PY", "flag": "🇵🇾"}, {"country": "Peru", "code": "PE", "flag": "🇵🇪"}, {"country": "Philippines", "code": "PH", "flag": "🇵🇭"}, {"country": "Pitcairn", "code": "PN", "flag": "🇵🇳"}, {"country": "Poland", "code": "PL", "flag": "🇵🇱"}, {"country": "Portugal", "code": "PT", "flag": "🇵🇹"}, {"country": "Puerto Rico", "code": "PR", "flag": "🇵🇷"}, {"country": "Qatar", "code": "QA", "flag": "🇶🇦"}, {"country": "Republic of the Congo", "code": "CG", "flag": "🇨🇬"}, {"country": "Romania", "code": "RO", "flag": "🇷🇴"}, {"country": "Russia", "code": "RU", "flag": "🇷🇺"}, {"country": "Rwanda", "code": "RW", "flag": "🇷🇼"}, {"country": "Réunion", "code": "RE", "flag": "🇷🇪"}, {"country": "Saint Barthélemy", "code": "BL", "flag": "🇧🇱"}, {"country": "Saint Helena, Ascension and Tristan da Cunha", "code": "SH", "flag": "🇸🇭"}, {"country": "Saint Kitts and Nevis", "code": "KN", "flag": "🇰🇳"}, {"country": "Saint Lucia", "code": "LC", "flag": "🇱🇨"}, {"country": "Saint Martin (French part)", "code": "MF", "flag": "🇲🇫"}, {"country": "Saint Pierre and Miquelon", "code": "PM", "flag": "🇵🇲"}, {"country": "Saint Vincent and the Grenadines", "code": "VC", "flag": "🇻🇨"}, {"country": "Samoa", "code": "WS", "flag": "🇼🇸"}, {"country": "San Marino", "code": "SM", "flag": "🇸🇲"}, {"country": "Sao Tome and Principe", "code": "ST", "flag": "🇸🇹"}, {"country": "Saudi Arabia", "code": "SA", "flag": "🇸🇦"}, {"country": "Senegal", "code": "SN", "flag": "🇸🇳"}, {"country": "Serbia", "code": "RS", "flag": "🇷🇸"}, {"country": "Seychelles", "code": "SC", "flag": "🇸🇨"}, {"country": "Sierra Leone", "code": "SL", "flag": "🇸🇱"}, {"country": "Singapore", "code": "SG", "flag": "🇸🇬"}, {"country": "Sint Maarten (Dutch part)", "code": "SX", "flag": "🇸🇽"}, {"country": "Slovakia", "code": "SK", "flag": "🇸🇰"}, {"country": "Slovenia", "code": "SI", "flag": "🇸🇮"}, {"country": "Solomon Islands", "code": "SB", "flag": "🇸🇧"}, {"country": "Somalia", "code": "SO", "flag": "🇸🇴"}, {"country": "South Africa", "code": "ZA", "flag": "🇿🇦"}, {"country": "South Georgia and the South Sandwich Islands", "code": "GS", "flag": "🇬🇸"}, {"country": "South Korea", "code": "KR", "flag": "🇰🇷"}, {"country": "South Sudan", "code": "SS", "flag": "🇸🇸"}, {"country": "Spain", "code": "ES", "flag": "🇪🇸"}, {"country": "Sri Lanka", "code": "LK", "flag": "🇱🇰"}, {"country": "Sudan", "code": "SD", "flag": "🇸🇩"}, {"country": "Suriname", "code": "SR", "flag": "🇸🇷"}, {"country": "Svalbard and Jan Mayen", "code": "SJ", "flag": "🇸🇯"}, {"country": "Sweden", "code": "SE", "flag": "🇸🇪"}, {"country": "Switzerland", "code": "CH", "flag": "🇨🇭"}, {"country": "Syria", "code": "SY", "flag": "🇸🇾"}, {"country": "Taiwan", "code": "TW", "flag": "🇹🇼"}, {"country": "Tajikistan", "code": "TJ", "flag": "🇹🇯"}, {"country": "Tanzania", "code": "TZ", "flag": "🇹🇿"}, {"country": "Thailand", "code": "TH", "flag": "🇹🇭"}, {"country": "Timor-Leste", "code": "TL", "flag": "🇹🇱"}, {"country": "Togo", "code": "TG", "flag": "🇹🇬"}, {"country": "Tokelau", "code": "TK", "flag": "🇹🇰"}, {"country": "Tonga", "code": "TO", "flag": "🇹🇴"}, {"country": "Trinidad and Tobago", "code": "TT", "flag": "🇹🇹"}, {"country": "Tunisia", "code": "TN", "flag": "🇹🇳"}, {"country": "Turkmenistan", "code": "TM", "flag": "🇹🇲"}, {"country": "Turks and Caicos Islands", "code": "TC", "flag": "🇹🇨"}, {"country": "Tuvalu", "code": "TV", "flag": "🇹🇻"}, {"country": "Türkiye", "code": "TR", "flag": "🇹🇷"}, {"country": "Uganda", "code": "UG", "flag": "🇺🇬"}, {"country": "Ukraine", "code": "UA", "flag": "🇺🇦"}, {"country": "United Arab Emirates", "code": "AE", "flag": "🇦🇪"}, {"country": "United Kingdom", "code": "GB", "flag": "🇬🇧"}, {"country": "United States", "code": "US", "flag": "🇺🇸"}, {"country": "United States Minor Outlying Islands", "code": "UM", "flag": "🇺🇲"}, {"country": "Uruguay", "code": "UY", "flag": "🇺🇾"}, {"country": "Uzbekistan", "code": "UZ", "flag": "🇺🇿"}, {"country": "Vanuatu", "code": "VU", "flag": "🇻🇺"}, {"country": "Vatican City", "code": "VA", "flag": "🇻🇦"}, {"country": "Venezuela", "code": "VE", "flag": "🇻🇪"}, {"country": "Vietnam", "code": "VN", "flag": "🇻🇳"}, {"country": "Virgin Islands, British", "code": "VG", "flag": "🇻🇬"}, {"country": "Virgin Islands, U.S.", "code": "VI", "flag": "🇻🇮"}, {"country": "Wallis and Futuna", "code": "WF", "flag": "🇼🇫"}, {"country": "Western Sahara", "code": "EH", "flag": "🇪🇭"}, {"country": "Yemen", "code": "YE", "flag": "🇾🇪"}, {"country": "Zambia", "code": "ZM", "flag": "🇿🇲"}, {"country": "Zimbabwe", "code": "ZW", "flag": "🇿🇼"}, {"country": "Åland Islands", "code": "AX", "flag": "🇦🇽"}];

const aliases = {uk:"United Kingdom",england:"United Kingdom",scotland:"United Kingdom",wales:"United Kingdom",usa:"United States",us:"United States",america:"United States",korea:"South Korea"};
function norm(v){ const raw=String(v||"").trim().replace(/\s+/g," "); return aliases[raw.toLowerCase()] || raw; }
function slug(v){ return norm(v).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
function def(country){ return countries.find(c => c[0].toLowerCase() === norm(country).toLowerCase()) || allCountries.find(c => c.country.toLowerCase() === norm(country).toLowerCase()); }
function flag(country){ const d = def(country); return Array.isArray(d) ? d[1] : (d?.flag || "📍"); }
function updateMapCount(){
  const pins = $$(".flag-pin");
  const total = pins.reduce((s,p)=>s + Number(p.dataset.count||1),0);
  const label = `${pins.length} countries • ${total} pins`;
  $("#mapCount").textContent = label;
  text($("#hubMapStat"), label);
}

function spotlightPin(){
  const pins = $$(".flag-pin");
  if(!pins.length) return;
  pins.forEach(pin => pin.classList.remove("spotlight"));
  const sorted = pins.slice().sort((a,b) => Number(b.dataset.count || 0) - Number(a.dataset.count || 0));
  const pin = sorted[Math.floor(Math.random() * Math.min(sorted.length, 16))];
  pin.classList.add("spotlight");
  text($("#mapLiveToast"), `${flag(pin.dataset.country)} ${pin.dataset.country} just joined the flag wall`);
  window.setTimeout(() => pin.classList.remove("spotlight"), 2200);
}

function startMapPulse(){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.setInterval(spotlightPin, 3600);
  window.setTimeout(spotlightPin, 900);
}

function rotateWallToast(){
  const notes = $$("#approvedWall article");
  if(!notes.length) return;
  const chosen = notes[Math.floor(Math.random() * notes.length)];
  const clone = chosen.cloneNode(true);
  const label = $("span", clone)?.textContent || "wall note";
  $("span", clone)?.remove();
  text($("#wallLiveToast span"), label);
  text($("#wallLiveToast strong"), clone.textContent.replace(/[“”]/g, "").trim());
}

function startWallPulse(){
  rotateWallToast();
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.setInterval(rotateWallToast, 5200);
}
function upsertPin(country, count, fresh=false){
  country = norm(country);
  let el = document.getElementById("pin-" + slug(country));
  const safeCount = Number(count || 0);
  if(!el){
    el = document.createElement("button");
    el.type = "button";
    el.className = "flag-pin";
    el.id = "pin-" + slug(country);
    $("#flagMap").appendChild(el);
  }
  el.dataset.country = country;
  el.dataset.count = safeCount;
  el.setAttribute("aria-label", `${country}: ${safeCount} Trendies pinned`);
  el.innerHTML = `<span class="pin-flag">${flag(country)}</span><span class="pin-country">${escapeHTML(country)}</span><span class="count">${safeCount}</span>`;
  el.onclick = () => alert(`${safeCount} Trendies have pinned ${country}`);
  if(fresh){ el.classList.remove("fresh"); void el.offsetWidth; el.classList.add("fresh"); }
  updateMapCount();
}
function initMap(){
  const list = $("#countries");
  countries.forEach(([c,f,x,y,n]) => upsertPin(c,n));
  if(list){
    allCountries.forEach(({country, flag}) => {
      list.insertAdjacentHTML("beforeend", `<option value="${country}">${flag} ${country}</option>`);
    });
  }
}
initMap();
startMapPulse();

async function loadCountryPins(){
  try{
    const res = await fetch("/api/country-pins");
    const data = await res.json();
    if(!res.ok || !data.ok || !Array.isArray(data.pins)) return;
    data.pins.forEach(p => {
      const country = norm(p.country);
      if(!country) return;
      const d = def(country);
      const base = Array.isArray(d) ? Number(d[4] || 0) : 0;
      upsertPin(country, base + Number(p.count || 0));
    });
    setStatus("#flagStatus","Live flag wall synced.");
  }catch(e){}
}
loadCountryPins();

function cityLine(city){
  const name = city.city || "A city";
  const count = Number(city.count || 0);
  const status = city.status || (count >= 25 ? "chapter potential" : count >= 8 ? "nearly ready" : "warming up");
  const activity = city.top_activity || "golden-hour plans";
  if(status === "chapter potential") return `${name} has chapter energy.`;
  if(status === "nearly ready") return `${name} is nearly ready.`;
  return `${name} is warming up.`;
}

async function loadChapterCities(){
  const grid = $("#chapterCitiesGrid");
  if(!grid) return;
  try{
    const data = await getJSON("/api/chapter-cities");
    const cities = Array.isArray(data.cities) ? data.cities : [];
    if(!cities.length) {
      grid.innerHTML = `<article><strong>Chapter One is warming up.</strong><span>Join the list to help your city appear here.</span></article>`;
      return;
    }
    grid.innerHTML = cities.map(city => `
      <article>
        <span>${escapeHTML(city.status || "warming up")}</span>
        <strong>${escapeHTML(cityLine(city))}</strong>
        <p>${escapeHTML(city.country || "Somewhere new")} • ${Number(city.count || 0)} interested Trendies</p>
        <small>${escapeHTML(city.top_activity || "general coming-of-age summer")}</small>
      </article>
    `).join("");
  }catch(e){
    grid.innerHTML = `<article><strong>City signals load on the live site.</strong><span>Join the list and help your city warm up.</span></article>`;
  }
}
loadChapterCities();

$("#flagForm")?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const button = $("button[type='submit']", e.currentTarget);
  const country = norm($("#countryInput").value);
  if(!country) return;
  const existing = $("#pin-" + slug(country));
  const d = def(country); const base = Array.isArray(d) ? d[4] : 0; const next = Number(existing?.dataset.count || base || 0) + 1;
  upsertPin(country, next, true);
  setStatus("#flagStatus","Pinned — count updated.");
  e.currentTarget.reset();
  if(button) button.disabled = true;
  try{
    const result = await postJSON("/api/submit-map-pin", {country, flag: flag(country)});
    if(result.pin?.count) { const d2 = def(country); const base2 = Array.isArray(d2) ? d2[4] : 0; upsertPin(country, Math.max(next, Number(result.pin.count) + base2)); }
  }catch(err){
    setStatus("#flagStatus","Pinned here, but live save failed. Try again in a moment.", true);
  }finally{
    if(button) button.disabled = false;
  }
});

$("#expandMap")?.addEventListener("click", ()=>document.body.classList.add("map-expanded"));
$("#closeMap")?.addEventListener("click", ()=>document.body.classList.remove("map-expanded"));
document.addEventListener("keydown", e => { if(e.key==="Escape") document.body.classList.remove("map-expanded") });

async function loadWall(){
  try{
    const notes = await getJSON("/api/approved-notes");
    if(!Array.isArray(notes) || !notes.length) return;
    $("#approvedWall").innerHTML = notes.slice(0,6).map(n=>`<article>“${escapeHTML(n.note || "")}” <span>${escapeHTML(n.category || n.vibe || "wall")}</span></article>`).join("");
    text($("#hubWallStat"), `${notes.length} approved wall notes live.`);
    rotateWallToast();
  }catch(e){}
}
loadWall();
startWallPulse();

const promptSets = {
  chapter: [
    ["Level 1", "What plan would make your summer feel cinematic but still safe?"],
    ["Level 1", "What place in your city would you show a new friend first?"],
    ["Level 1", "What is your perfect daylight first hang: picnic, walk, market, gallery, or cards?"],
    ["Level 1", "What song would play over the opening scene of your summer?"],
    ["Level 1", "What snack instantly makes a plan feel warmer?"],
    ["Level 1", "What is one small thing that makes you feel welcomed when you arrive?"],
    ["Level 1", "What would you put in a photo dump called Chapter One?"],
    ["Level 1", "What is a local place you have always wanted an excuse to explore?"],
    ["Level 1", "What daytime plan would you invite someone to if you were feeling brave?"],
    ["Level 1", "What is your easiest yes: live music, card games, short films, or exploring somewhere new?"],
    ["Level 1", "What does your ideal group chat message say before a plan?"],
    ["Level 1", "What would make a picnic feel like a scene from your life, not just a plan?"],
    ["Level 2", "Who do you become when you stop waiting to be invited?"],
    ["Level 2", "What kind of friend are you hoping to meet in Chapter One?"],
    ["Level 2", "What small brave yes could change this week for you?"],
    ["Level 2", "What version of you comes out around people who make life feel bigger?"],
    ["Level 2", "What is something you love but rarely get to share with new people?"],
    ["Level 2", "What would make you feel like you belonged without needing to perform?"],
    ["Level 2", "What is one thing you wish more people understood about this chapter of your life?"],
    ["Level 2", "What plan would help you expand your circle without feeling forced?"],
    ["Level 2", "What is a memory you want to create before summer ends?"],
    ["Level 2", "What makes a stranger start feeling like a friend?"],
    ["Level 2", "What part of growing up are you secretly excited for?"],
    ["Level 2", "What part of growing up feels confusing but kind of beautiful?"],
    ["Level 2", "What would you do this month if you knew someone else wanted to join too?"],
    ["Level 2", "What would make you say, this is exactly why I joined Trendies?"],
    ["Level 2", "What is one thing you bring to a group that people might not notice at first?"],
    ["Level 3", "What are you ready to outgrow before this chapter ends?"],
    ["Level 3", "What memory do you want to be telling people about in September?"],
    ["Level 3", "What are you no longer shrinking yourself to fit into?"],
    ["Level 3", "What kind of people make you feel more like yourself?"],
    ["Level 3", "What old story about friendship are you ready to rewrite?"],
    ["Level 3", "What would change if you treated connection like something you can practise?"],
    ["Level 3", "What do you want your future self to thank you for trying?"],
    ["Level 3", "Where have you been waiting for permission to begin?"],
    ["Level 3", "What does having your coming of age with other people mean to you?"],
    ["Level 3", "What would you say to someone who thinks everyone already has their people except them?"],
    ["Level 3", "What kind of summer would feel honest, not performative?"],
    ["Friendship", "What is a green flag in a new friend?"],
    ["Friendship", "What makes you feel safe enough to be funny around someone new?"],
    ["Friendship", "What is one question you wish people asked more often?"],
    ["Friendship", "What does expanding your circle look like without losing yourself?"],
    ["Friendship", "What small ritual could turn strangers into a community?"],
    ["Creative", "If this summer became a short film, what would the first shot be?"],
    ["Creative", "What would you photograph if you wanted to remember how this chapter felt?"],
    ["Creative", "What tiny creative project could a group finish in one afternoon?"],
    ["Creative", "What would your coming-of-age playlist be called?"],
    ["Creative", "What object would you keep as proof that this summer happened?"],
    ["Golden hour", "Where would you take a friend for the best golden-hour walk?"],
    ["Golden hour", "What would you want everyone to write on a blanket note before sunset?"],
    ["Golden hour", "What is one ordinary moment that would feel cinematic with the right people?"],
    ["Tiny dare", "Compliment someone at the next plan on something specific and real."],
    ["Tiny dare", "Ask one person what they are excited to become this year."],
    ["Tiny dare", "Bring one extra snack for someone who came alone."],
    ["Tiny dare", "Suggest a public plan instead of waiting for someone else to do it."],
    ["Tiny dare", "Take one photo that feels like evidence of being alive."],
    ["Wild card", "Pick a public place, a snack, a song and one person you would invite."],
    ["Wild card", "Choose the chapter title for the next plan in five words."],
    ["Wild card", "Design a no-pressure hang that costs under 10 pounds."],
    ["Wild card", "Choose: picnic blanket, disposable camera, card deck, or speaker. Why?"],
    ["Wild card", "Make a plan where the only rule is that everyone can arrive alone."],
    ["Wild card", "What would Trendies host in your city if it listened to you first?"]
  ],
  soft: [
    ["Soft start", "What would make arriving alone feel easier?"],
    ["Soft start", "What activity feels low-pressure enough for a first hang?"],
    ["Soft start", "What would you want the group chat to say before a plan?"],
    ["Soft start", "What is a safe public plan you would actually say yes to?"],
    ["Soft start", "What is one thing you could bring to make a picnic feel warmer?"],
    ["Soft start", "What city corner makes you feel most like yourself?"],
    ["Soft start", "What would help you feel comfortable saying, I am new here?"],
    ["Soft start", "What is a good first question that does not feel too intense?"],
    ["Soft start", "What kind of plan lets people talk without pressure?"],
    ["Soft start", "What is one boundary that would help you enjoy meeting new people?"],
    ["Soft start", "What information do you need before deciding to show up?"],
    ["Soft start", "What time of day feels easiest for meeting new people in public?"],
    ["Soft start", "What would make a group feel welcoming before anyone arrives?"],
    ["Soft start", "What is your favourite low-cost way to spend an afternoon?"],
    ["Soft start", "What is a gentle way to leave a plan if you feel tired?"],
    ["Soft start", "What would make the first five minutes less awkward?"],
    ["Soft start", "What do you hope someone notices about you beyond the basics?"],
    ["Soft start", "What would make you invite a friend and still meet new people?"],
    ["Soft start", "What kind of public setting helps conversation flow naturally?"],
    ["Soft start", "What would a no-pressure creative hang look like for you?"],
    ["Soft start", "What makes a plan feel safe, clear and worth leaving the house for?"],
    ["Soft start", "What would you want to know about the host before coming?"],
    ["Soft start", "What is one thing you never want people to feel at a Trendies plan?"],
    ["Soft start", "What is a small welcome ritual that would calm your nerves?"],
    ["Soft start", "What would make it easier to come back for a second plan?"]
  ]
};

let lastPromptQuestions = new Set();

function shuffle(items){
  return items.slice().sort(() => Math.random() - 0.5);
}

function renderPrompts(kind="chapter"){
  const board = $("#promptBoard");
  if(!board) return;
  const pool = shuffle(promptSets[kind] || promptSets.chapter);
  let cards = pool.filter(([, question]) => !lastPromptQuestions.has(question)).slice(0, 3);
  if(cards.length < 3) cards = pool.slice(0, 3);
  lastPromptQuestions = new Set(cards.map(([, question]) => question));
  board.innerHTML = cards.map(([level, question]) => `
    <button class="prompt-card" type="button">
      <span>${escapeHTML(level)}</span>
      <strong>${escapeHTML(question)}</strong>
    </button>
  `).join("");
  $$(".prompt-card", board).forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("is-open"));
  });
}

$("#shufflePrompts")?.addEventListener("click", () => renderPrompts("chapter"));
$("#softPrompts")?.addEventListener("click", () => renderPrompts("soft"));
renderPrompts("chapter");

loadEditableContent();
loadBlogPosts();
