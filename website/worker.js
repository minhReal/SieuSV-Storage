const REPO="minhReal/SieuSV-Storage";
const SITE="https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev";
const PAGES_ORIGIN="https://minhreal.github.io";
const COOKIE="ssv_session";
const STATE_COOKIE="ssv_oauth_state";
const CONSENT_COOKIE="ssv_oauth_consent";
const PENDING_COOKIE="ssv_pending_registration";
const TERMS_VERSION="2026-11-10";
const PRIVACY_VERSION="2026-11-10";
const COMMUNITY_FEATURES_ENABLED=false;
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/=/g,"").replaceAll("+","-").replaceAll("/","_");
const unb64u=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
const cookie=(name,value,maxAge)=>name+"="+value+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+maxAge;
function getCookie(req,name){return (req.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="))?.slice(name.length+1)||""}
async function sign(value,secret){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64u(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value)))}
async function makeSession(sub,secret,version=0){const payload=b64u(new TextEncoder().encode(JSON.stringify({sub,exp:Math.floor(Date.now()/1000)+604800,ver:Number.isSafeInteger(Number(version))&&Number(version)>=0?Number(version):0})));return payload+"."+await sign(payload,secret)}
function constantTimeEqual(a,b){if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
async function makeConsentTicket(state,secret){const now=Math.floor(Date.now()/1000),payload=b64u(new TextEncoder().encode(JSON.stringify({state,terms:TERMS_VERSION,privacy:PRIVACY_VERSION,acceptedAt:now,exp:now+600})));return payload+"."+await sign(payload,secret)}
async function readConsentTicket(req,secret,state){try{const [p,s]=getCookie(req,CONSENT_COOKIE).split(".");if(!p||!s||!secret)return null;const expected=await sign(p,secret);if(!constantTimeEqual(s,expected))return null;const v=JSON.parse(new TextDecoder().decode(unb64u(p))),now=Math.floor(Date.now()/1000);if(!v||v.state!==state||v.terms!==TERMS_VERSION||v.privacy!==PRIVACY_VERSION||!Number.isSafeInteger(v.acceptedAt)||!Number.isSafeInteger(v.exp)||v.exp<=now||v.acceptedAt>now+30||v.exp-v.acceptedAt!==600)return null;return v}catch{return null}}
async function makePendingTicket(profile,consent,secret){
 const now=Math.floor(Date.now()/1000),display=String(profile.name||"").trim().replace(/\s+/g," ").slice(0,40)||"User";
 const base=display.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,32);
 const username=base.length>=3?base:"user",avatar=typeof profile.picture==="string"&&/^https:\/\//i.test(profile.picture)?profile.picture.slice(0,1000):"";
 const value={sub:String(profile.sub),display_name:display,username,avatar_url:avatar,terms:consent.terms,privacy:consent.privacy,acceptedAt:consent.acceptedAt,exp:now+600};
 const payload=b64u(new TextEncoder().encode(JSON.stringify(value)));
 return payload+"."+await sign(payload,secret);
}
async function readPendingTicket(req,secret){
 try{
  const [p,s]=getCookie(req,PENDING_COOKIE).split(".");
  if(!p||!s||!secret)return null;
  const expected=await sign(p,secret);
  if(!constantTimeEqual(s,expected))return null;
  const v=JSON.parse(new TextDecoder().decode(unb64u(p))),now=Math.floor(Date.now()/1000);
  if(!v||typeof v.sub!=="string"||!v.sub||v.terms!==TERMS_VERSION||v.privacy!==PRIVACY_VERSION||!Number.isSafeInteger(v.acceptedAt)||!Number.isSafeInteger(v.exp)||v.exp<=now||v.exp-now>600||v.acceptedAt>now+30)return null;
  return v;
 }catch{return null}
}
async function readJsonBody(request,maxBytes){
 const declared=request.headers.get("content-length")||"";
 if(/^\d+$/.test(declared)&&Number(declared)>maxBytes)return {ok:false,error:"payload_too_large",status:413};
 const reader=request.body?.getReader();
 if(!reader)return {ok:false,error:"invalid_json",status:400};
 const chunks=[];let total=0;
 try{
  while(true){
   const part=await reader.read();
   if(part.done)break;
   total+=part.value.byteLength;
   if(total>maxBytes){
    try{await reader.cancel()}catch{}
    return {ok:false,error:"payload_too_large",status:413};
   }
   chunks.push(part.value);
  }
  const bytes=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  const value=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
  if(!value||typeof value!=="object"||Array.isArray(value))return {ok:false,error:"invalid_json",status:400};
  return {ok:true,body:value};
 }catch{return {ok:false,error:"invalid_json",status:400}}
 finally{try{reader.releaseLock()}catch{}}
}
async function readSession(req,secret){try{const [p,s]=getCookie(req,COOKIE).split(".");if(!p||!s||!secret)return null;const expected=await sign(p,secret);if(!constantTimeEqual(s,expected))return null;const v=JSON.parse(new TextDecoder().decode(unb64u(p)));if(!v||typeof v.sub!=="string"||v.exp<=Date.now()/1000)return null;const ver=v.ver===undefined?0:v.ver;if(!Number.isSafeInteger(ver)||ver<0)return null;return {...v,ver}}catch{return null}}
async function githubFile(path,request){
 if(!safeManifestPath(path)||path.length>500)return {status:400,source:null};
 const cacheKey=new Request(new URL("/__github_cache_v4/"+encodeURIComponent(path),request.url));
 const cache=caches.default;
 let cached=null;
 try{cached=await cache.match(cacheKey)}catch{}
 try{
  const upstream="https://raw.githubusercontent.com/"+REPO+"/main/"+path.split("/").map(encodeURIComponent).join("/");
  let r;
  for(let attempt=0;attempt<2;attempt++){
   try{r=await fetch(upstream,{headers:{"user-agent":"Sieu-Sv_Library"}});if(r.ok||r.status===404||r.status===403||r.status===413)break}catch{}
  }
  if(r?.ok){
   const maxBytes=1500000,declared=Number(r.headers.get("content-length")||0);
   if(declared>maxBytes){try{await r.body?.cancel()}catch{};return {status:413,source:null}}
   const reader=r.body?.getReader();
   if(!reader)return {status:503,source:null};
   const chunks=[];let total=0;
   while(true){
    const part=await reader.read();
    if(part.done)break;
    total+=part.value.byteLength;
    if(total>maxBytes){try{await reader.cancel()}catch{};return {status:413,source:null}}
    chunks.push(part.value);
   }
   const bytes=new Uint8Array(total);let offset=0;
   for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
   const source=new TextDecoder("utf-8",{fatal:false}).decode(bytes);
   try{await cache.put(cacheKey,new Response(source,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=300"}}))}catch{}
   return {status:200,source};
  }
  if(r?.status===404)return {status:404,source:null};
  if(r?.status===413)return {status:413,source:null};
  if(cached){const source=await cached.text();if(source.length<=1500000)return {status:200,source,stale:true}}
  return {status:503,source:null};
 }catch{
  if(cached){try{const source=await cached.text();if(source.length<=1500000)return {status:200,source,stale:true}}catch{}}
  return {status:503,source:null};
 }
}

function githubUser(user){return user?{login:String(user.login||"unknown"),avatar_url:user.avatar_url||null,html_url:user.html_url||null}:null}
async function githubApi(value){try{const url=new URL(value);if(url.protocol!=="https:"||url.hostname!=="api.github.com"||!url.pathname.startsWith("/repos/"+REPO+"/"))return null;const r=await fetch(url.toString(),{headers:{"accept":"application/vnd.github+json","user-agent":"Sieu-Sv_Library"},cf:{cacheTtl:300,cacheEverything:true}});if(!r.ok)return null;const length=Number(r.headers.get("content-length")||0);if(length>5000000)return null;const raw=await r.text();if(raw.length>5000000)return null;return JSON.parse(raw)}catch{return null}}
function safeManifestPath(value){return typeof value==="string"&&value.length>0&&value.length<300&&!value.startsWith("/")&&!value.includes("\\")&&!/[?#]/.test(value)&&![...value].some(c=>{const n=c.charCodeAt(0);return n<32||n===127})&&!value.split("/").some(p=>!p||p==="."||p==="..")}
async function githubIndex(request){
 const key=new Request(new URL("/__github_manifest_index_v5",request.url)),cache=caches.default;
 try{const cached=await cache.match(key);if(cached)return await cached.json()}catch{}
 const tree=await githubApi("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1&svs=5");
 if(!tree||!Array.isArray(tree.tree)||tree.truncated)throw new Error("github_tree_unavailable");
 const treeFiles=new Set(tree.tree.filter(x=>x.type==="blob").map(x=>x.path));
 const manifestPaths=tree.tree.filter(x=>x.type==="blob"&&(x.path.split("/").pop()==="SVS.json"||x.path.split("/").pop()==="svs.json")).map(x=>x.path),records=[];
 await Promise.all(manifestPaths.map(async manifestPath=>{
  const folder=manifestPath.slice(0,manifestPath.lastIndexOf("/")),raw=await githubFile(manifestPath,request);
  if(!raw.source)return;
  let manifest;try{manifest=JSON.parse(raw.source)}catch{return}
  if(!manifest||typeof manifest!=="object"||Array.isArray(manifest)||raw.source.length>65536)return;
  const listed=[];
  for(const entry of (Array.isArray(manifest.files)?manifest.files:[]).slice(0,100)){
   const rel=typeof entry==="string"?entry:entry?.path;
   if(!safeManifestPath(rel)||!treeFiles.has(folder+"/"+rel))continue;
   if(!listed.some(x=>x.path===rel))listed.push({path:rel,role:typeof entry==="object"&&typeof entry.role==="string"?entry.role:"file"});
  }
  const importParts=(Array.isArray(manifest.import_parts)?manifest.import_parts:[]).filter(safeManifestPath).filter(x=>treeFiles.has(folder+"/"+x)).slice(0,20);
  const sourcePath=safeManifestPath(manifest.source)&&treeFiles.has(folder+"/"+manifest.source)?manifest.source:(listed.find(x=>/\.(lua|luau)$/i.test(x.path))?.path||importParts[0]||"");
  if(!sourcePath)return;
  if(!listed.some(x=>x.path===sourcePath))listed.unshift({path:sourcePath,role:importParts.includes(sourcePath)?"import_part":"main"});
  for(const rel of importParts)if(!listed.some(x=>x.path===rel))listed.push({path:rel,role:"import_part"});
  const manifestFile=manifestPath.slice(manifestPath.lastIndexOf("/")+1);if(!listed.some(x=>x.path===manifestFile))listed.unshift({path:manifestFile,role:"manifest"});
  const fallback=manifestPath.slice(0,manifestPath.lastIndexOf("/")).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const id=String(manifest.id||fallback).slice(0,100);
  if(!/^[a-z0-9][a-z0-9-]*$/.test(id))return;
  const method=["source","import","both"].includes(manifest.method)?manifest.method:"source";
  const thumb=safeManifestPath(manifest.thumbnail)&&treeFiles.has(folder+"/"+manifest.thumbnail)?"https://raw.githubusercontent.com/"+REPO+"/main/"+(folder+"/"+manifest.thumbnail).split("/").map(encodeURIComponent).join("/") : null;
  records.push({id,folder,manifestPath,manifest:{...manifest},title:String(manifest.title||id).slice(0,100),description:String(manifest.description||"").slice(0,1000),category:(String(manifest.category||"Other").trim()==="Studio Tools"?"Plugins":String(manifest.category||"Other")).slice(0,60),tag:String(typeof manifest.tag==="string"&&manifest.tag.trim()?manifest.tag.trim():"Github").slice(0,48),method,source:sourcePath,files:listed,importParts,thumbnail_url:thumb||"https://raw.githubusercontent.com/"+REPO+"/main/thumDefault.jpg",repo_url:"https://github.com/"+REPO+"/tree/main/"+folder.split("/").map(encodeURIComponent).join("/")});
 }));
 records.sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));
 const prs=await githubApi("https://api.github.com/repos/"+REPO+"/pulls?state=closed&per_page=100&sort=updated&direction=desc")||[],merged=prs.filter(p=>p.merged_at&&p.user).slice(0,20),contributions={};
 await Promise.all(merged.map(async pr=>{
  const changed=await githubApi(pr.url+"/files?per_page=100");if(!Array.isArray(changed))return;const touched=new Set();
  for(const file of changed){if(!file||typeof file.filename!=="string")continue;for(const record of records)if(file.filename===record.folder||file.filename.startsWith(record.folder+"/"))touched.add(record.folder)}
  for(const folder of touched){if(!contributions[folder])contributions[folder]=[];contributions[folder].push({number:pr.number,title:String(pr.title||"Pull Request").slice(0,200),url:pr.html_url,merged_at:pr.merged_at,author:githubUser(pr.user)})}
 }));
 const repoOwner={login:"minhReal",avatar_url:"https://avatars.githubusercontent.com/u/175275111?v=4",html_url:"https://github.com/minhReal"};
 const scripts=records.map(record=>{
  const history=(contributions[record.folder]||[]).sort((a,b)=>new Date(a.merged_at)-new Date(b.merged_at)),added=history[0]||null,updated=history[history.length-1]||null,creator=added?.author||repoOwner;
  return {path:record.folder+"/"+record.source,name:record.title,title:record.title,description:record.description,category:record.category,tag:record.tag,repo_url:record.repo_url,upload_method:record.method,thumbnail_url:record.thumbnail_url,author:creator.login,username:creator.login,avatar_url:creator.avatar_url,html_url:creator.html_url,github_id:record.id,github_folder:record.folder,added_by:creator,last_updated_by:updated?.author||creator,pull_requests:history,initial_pr:added,latest_pr:updated};
 });
 const result={scripts,records:records.map(({manifest,...r})=>r),syncedAt:new Date().toISOString()};
 try{await cache.put(key,new Response(JSON.stringify(result),{headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=300"}}))}catch{}
 return result;
}

async function currentUser(req,env){const session=await readSession(req,env.gg_secret);if(!session)return null;const user=await env.DB.prepare("SELECT id,public_id,username,display_name,avatar_url,bio,created_at,username_updated_at,session_version FROM users WHERE google_sub=? LIMIT 1").bind(session.sub).first();if(!user||Number(user.session_version||0)!==session.ver)return null;return user}
async function handle(request,env){
 const url=new URL(request.url),origin=SITE;
 if(!COMMUNITY_FEATURES_ENABLED){
  const path=url.pathname;
  if(path==="/api/scripts"&&request.method==="GET")return json({scripts:[]});
  if(path==="/api/me"&&request.method!=="GET")return json({error:"read_only",message:"Account data can only be viewed in read-only mode."},405);
  if(path==="/profile"||path.startsWith("/profile/")||path==="/upload"||path==="/settings")return new Response(null,{status:302,headers:{Location:origin+"/","Cache-Control":"no-store"}});
  if(path==="/api/me/profile"||path==="/api/reports"||path==="/api/scripts"||path.startsWith("/api/scripts/")||path.startsWith("/api/profile/"))return json({error:"community_paused",message:"The library is read-only. Uploads, profile edits, votes and reports are disabled."},503,{"Retry-After":"86400"});
 }
 const assetFiles={
  "/assets/index.css":["index.css","text/css; charset=utf-8"],
  "/assets/index.js":["index.js","application/javascript; charset=utf-8"],
  "/assets/script.css":["script.css","text/css; charset=utf-8"],
  "/assets/script.js":["script.js","application/javascript; charset=utf-8"]
 };
 if(request.method==="GET"&&assetFiles[url.pathname]){
  const [file,type]=assetFiles[url.pathname];
  const asset=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/assets/"+file+"?__fresh="+Date.now(),{headers:{"cache-control":"no-cache","user-agent":"Sieu-Sv_Library"}});
  if(!asset.ok)return new Response("Website asset not found",{status:502,headers:{"cache-control":"no-store"}});
  return new Response(await asset.text(),{headers:{"content-type":type,"cache-control":"no-store","X-Content-Type-Options":"nosniff"}});
 }
 if((request.method==="POST"||request.method==="PUT")&&(["/auth/logout","/auth/google","/auth/complete-account","/api/me/profile","/api/scripts","/api/reports"].includes(url.pathname)||(request.method==="POST"&&/^\/api\/scripts\/[^/]+\/vote$/.test(url.pathname))||(request.method==="PUT"&&url.pathname.startsWith("/api/scripts/")))){
  if(request.headers.get("Origin")!==url.origin||request.headers.get("Sec-Fetch-Site")==="cross-site")return json({error:"csrf_rejected"},403);
  if(url.pathname!=="/auth/logout"&&!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")||""))return json({error:"json_required"},415);
 }
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"Allow":"GET, POST, OPTIONS"}});
 if(url.pathname==="/auth/google"&&request.method==="GET"){
  return new Response(null,{status:302,headers:{Location:origin+"/?login=consent_required","Cache-Control":"no-store"}});
 }
 if(url.pathname==="/auth/google"&&request.method==="POST"){
  if(!env.GOOGLE_CLIENT_ID||!env.gg_secret||!(env.GOOGLE_CLIENT_SECRET||env.gg_secret))return json({error:"oauth_not_configured",message:"Google sign-in is not configured."},503);
  const parsed=await readJsonBody(request,2048);
  if(!parsed.ok)return json({error:parsed.error},parsed.status);
  const body=parsed.body;
  if(body.termsAccepted!==true||body.privacyAcknowledged!==true||body.guardianPermission!==true)return json({error:"consent_required",message:"Accept the Terms, acknowledge the Privacy Policy and confirm any required parent or guardian permission before continuing."},400);
  const state=b64u(crypto.getRandomValues(new Uint8Array(32)));
  const consentTicket=await makeConsentTicket(state,env.gg_secret);
  const redirect=origin+"/auth/google/callback";
  const google=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:redirect,response_type:"code",scope:"openid email profile",state,access_type:"online",prompt:"select_account"}).toString();
  const headers=new Headers({"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
  headers.append("Set-Cookie",cookie(STATE_COOKIE,state,600));
  headers.append("Set-Cookie",cookie(CONSENT_COOKIE,consentTicket,600));
  return new Response(JSON.stringify({url:google.toString()}),{status:200,headers});
 }
 if(url.pathname==="/auth/google/callback"&&request.method==="GET"){
  const state=url.searchParams.get("state")||"",saved=getCookie(request,STATE_COOKIE),code=url.searchParams.get("code"),consent=await readConsentTicket(request,env.gg_secret,state);
  if(!state||!saved||!constantTimeEqual(state,saved)||!code||!consent)return new Response("OAuth state or consent is invalid or expired. Please start sign-in again.",{status:400,headers:{"Cache-Control":"no-store"}});
  const tokenRes=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET||env.gg_secret,redirect_uri:origin+"/auth/google/callback",grant_type:"authorization_code"})});
  const token=await tokenRes.json();
  if(!tokenRes.ok||!token.access_token)return new Response("Google token exchange failed. Check OAuth Client ID, Client Secret and redirect URI.",{status:502});
  const userRes=await fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{authorization:"Bearer "+token.access_token}});
  const profile=await userRes.json();
  if(!userRes.ok||!profile.sub||!profile.email_verified)return new Response("Google account could not be verified.",{status:401});
  const old=await env.DB.prepare("SELECT id,public_id,username,session_version FROM users WHERE google_sub=? LIMIT 1").bind(profile.sub).first();
  if(old){
   await env.DB.prepare("INSERT INTO account_consents (google_sub,terms_version,privacy_version,accepted_at) VALUES (?,?,?,?) ON CONFLICT(google_sub) DO UPDATE SET terms_version=excluded.terms_version,privacy_version=excluded.privacy_version,accepted_at=excluded.accepted_at").bind(profile.sub,consent.terms,consent.privacy,consent.acceptedAt).run();
   const session=await makeSession(profile.sub,env.gg_secret,Number(old.session_version||0));
   const headers=new Headers({Location:origin+"/?login=success","Cache-Control":"no-store"});
   headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(PENDING_COOKIE,"",0));headers.append("Set-Cookie",cookie(STATE_COOKIE,"",0));headers.append("Set-Cookie",cookie(CONSENT_COOKIE,"",0));
   return new Response(null,{status:302,headers});
  }
  const pending=await makePendingTicket(profile,consent,env.gg_secret);
  const headers=new Headers({Location:origin+"/?setup=1","Cache-Control":"no-store"});
  headers.append("Set-Cookie",cookie(COOKIE,"",0));headers.append("Set-Cookie",cookie(PENDING_COOKIE,pending,600));headers.append("Set-Cookie",cookie(STATE_COOKIE,"",0));headers.append("Set-Cookie",cookie(CONSENT_COOKIE,"",0));
  return new Response(null,{status:302,headers});
 }
 if(url.pathname==="/auth/pending"&&request.method==="GET"){
  const pending=await readPendingTicket(request,env.gg_secret);
  if(!pending)return json({registration:null},401);
  return json({registration:{display_name:pending.display_name,username:pending.username,avatar_url:pending.avatar_url}});
 }
 if(url.pathname==="/auth/complete-account"&&request.method==="POST"){
  const pending=await readPendingTicket(request,env.gg_secret);
  if(!pending)return json({error:"registration_expired",message:"Your registration session expired. Start Google sign-in again."},401);
  const parsed=await readJsonBody(request,370000);
  if(!parsed.ok)return json({error:parsed.error},parsed.status);
  const body=parsed.body,requestedUsername=String(body.username??"").trim().toLowerCase(),requestedDisplay=String(body.display_name??"").trim().replace(/\s+/g," ");
  const avatar=String(body.avatar_url??pending.avatar_url??"").trim();
  if(!/^[a-z0-9_]{3,32}$/.test(requestedUsername))return json({error:"invalid_username",message:"Username must be 3-32 characters and use only lowercase letters, numbers or underscores."},400);
  if(requestedDisplay.length<1||requestedDisplay.length>40)return json({error:"invalid_display_name",message:"Display name must be 1-40 characters."},400);
  if(avatar.length>330000)return json({error:"invalid_avatar",message:"Avatar image is too large."},400);
  if(avatar&&!(/^https:\/\//i.test(avatar)&&avatar.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar))return json({error:"invalid_avatar",message:"Avatar must be an HTTPS URL or a supported image uploaded from your device."},400);
  const existing=await env.DB.prepare("SELECT id,session_version FROM users WHERE google_sub=? LIMIT 1").bind(pending.sub).first();
  if(existing){
   const session=await makeSession(pending.sub,env.gg_secret,Number(existing.session_version||0));
   const headers=new Headers({"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
   headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(PENDING_COOKIE,"",0));
   return new Response(JSON.stringify({ok:true,existing:true}),{status:200,headers});
  }
  const displayKey=value=>String(value).normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
  let finalUsername="",finalDisplay="";
  for(let attempt=0;attempt<12;attempt++){
   finalUsername=requestedUsername;
   for(let n=2;n<10000;n++){
    const used=await env.DB.prepare("SELECT 1 AS found FROM users WHERE username=? LIMIT 1").bind(finalUsername).first();
    if(!used)break;
    const suffix=String(n);finalUsername=requestedUsername.slice(0,32-suffix.length)+suffix;
   }
   if(await env.DB.prepare("SELECT 1 AS found FROM users WHERE username=? LIMIT 1").bind(finalUsername).first())continue;
   finalDisplay=requestedDisplay;
   for(let n=2;n<10000;n++){
    const key=displayKey(finalDisplay),used=await env.DB.prepare("SELECT 1 AS found FROM users WHERE display_name_key=? OR lower(trim(display_name))=? LIMIT 1").bind(key,key).first();
    if(!used)break;
    const suffix=" "+n;finalDisplay=requestedDisplay.slice(0,40-suffix.length).trimEnd()+suffix;
   }
   const key=displayKey(finalDisplay);
   try{
    await env.DB.batch([
     env.DB.prepare("INSERT INTO users (id,google_sub,username,display_name,display_name_key,avatar_url,public_id) VALUES (?,?,?,?,?,?,?)").bind(pending.sub,pending.sub,finalUsername,finalDisplay,key,avatar,crypto.randomUUID().replaceAll("-","").slice(0,16)),
     env.DB.prepare("INSERT INTO account_consents (google_sub,terms_version,privacy_version,accepted_at) VALUES (?,?,?,?) ON CONFLICT(google_sub) DO UPDATE SET terms_version=excluded.terms_version,privacy_version=excluded.privacy_version,accepted_at=excluded.accepted_at").bind(pending.sub,pending.terms,pending.privacy,pending.acceptedAt)
    ]);
    break;
   }catch(error){
    const raced=await env.DB.prepare("SELECT id FROM users WHERE google_sub=? LIMIT 1").bind(pending.sub).first();
    if(raced)break;
    if(attempt===11)return json({error:"account_create_failed",message:"Could not reserve a unique name. Please try again."},409);
   }
  }
  const user=await env.DB.prepare("SELECT id,session_version FROM users WHERE google_sub=? LIMIT 1").bind(pending.sub).first();
  if(!user)return json({error:"account_create_failed",message:"Could not create your account. Please try again."},409);
  const session=await makeSession(pending.sub,env.gg_secret,Number(user.session_version||0));
  const headers=new Headers({"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
  headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(PENDING_COOKIE,"",0));
  return new Response(JSON.stringify({ok:true,username:finalUsername,display_name:finalDisplay}),{status:201,headers});
 }
 if(url.pathname==="/auth/logout"&&request.method==="POST"){const session=await readSession(request,env.gg_secret);if(session)await env.DB.prepare("UPDATE users SET session_version=COALESCE(session_version,0)+1 WHERE google_sub=?").bind(session.sub).run();return json({ok:true},200,{"Set-Cookie":cookie(COOKIE,"",0)})}
 if(url.pathname==="/api/me"&&request.method==="GET"){const user=await currentUser(request,env);if(user){delete user.id;delete user.session_version}return json({user})}
 if(url.pathname==="/api/me/profile"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  const parsedBody=await readJsonBody(request,370000);if(!parsedBody.ok)return json({error:parsedBody.error,message:parsedBody.error==="payload_too_large"?"Profile image is too large.":undefined},parsedBody.status);const body=parsedBody.body;
  const username=String(body.username??user.username??"").trim().toLowerCase(),display=String(body.display_name??user.display_name??"").trim(),bio=String(body.bio??user.bio??"").trim(),avatar=String(body.avatar_url??user.avatar_url??"").trim();
  if(!/^[a-z0-9_]{3,32}$/.test(username))return json({error:"invalid_username",message:"Username must be 3-32 characters and use only lowercase letters, numbers or underscores."},400);
  if(display.length<1||display.length>40)return json({error:"invalid_display_name",message:"Display name must be 1-40 characters."},400);
  if(bio.length>160)return json({error:"bio_too_long",message:"Bio must be 160 characters or less."},400);
  if(avatar&&avatar.length>330000)return json({error:"invalid_avatar",message:"Avatar image is too large."},400);
  if(avatar&&!(/^https:\/\//i.test(avatar)&&avatar.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar))return json({error:"invalid_avatar",message:"Avatar must be an HTTPS URL or a supported image uploaded from your device."},400);
  const now= Math.floor(Date.now()/1000);
  const profileRate=await env.DB.prepare("INSERT INTO profile_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();
  if(!profileRate||profileRate.request_count>12)return json({error:"profile_rate_limited",message:"Too many profile updates. Try again later."},429,{"Retry-After":"3600"});
  const row=await env.DB.prepare("SELECT username,username_updated_at,display_name,display_name_updated_at FROM users WHERE id=?").bind(user.id).first();
  const usernameChanged=username!==(row?.username||"");
  const displayChanged=display!==(row?.display_name||"");
  if(usernameChanged&&row?.username_updated_at&&now-row.username_updated_at<2592000)return json({error:"username_cooldown",message:"You can change your username once every 30 days."},429,{"Retry-After":String(2592000-(now-row.username_updated_at))});
  if(displayChanged&&row?.display_name_updated_at&&now-row.display_name_updated_at<604800)return json({error:"display_name_cooldown",message:"You can change your display name once every 7 days."},429,{"Retry-After":String(604800-(now-row.display_name_updated_at))});
  try{
   if(usernameChanged){await env.DB.batch([env.DB.prepare("INSERT INTO username_history (user_id,username,changed_at) VALUES (?,?,?)").bind(user.id,row.username,now),env.DB.prepare("UPDATE users SET username=?,display_name=?,bio=?,avatar_url=?,username_updated_at=?,display_name_updated_at=CASE WHEN ? THEN ? ELSE display_name_updated_at END WHERE id=?").bind(username,display,bio,avatar,now,displayChanged?1:0,now,user.id)]);}
   else{await env.DB.prepare("UPDATE users SET display_name=?,bio=?,avatar_url=?,display_name_updated_at=CASE WHEN ? THEN ? ELSE display_name_updated_at END WHERE id=?").bind(display,bio,avatar,displayChanged?1:0,now,user.id).run();}
  }catch{return json({error:"username_taken",message:"That username is already in use. Choose another one."},409)}
  const updatedUser=await currentUser(request,env);if(updatedUser){delete updatedUser.id;delete updatedUser.session_version}return json({ok:true,user:updatedUser});
 }
 if(url.pathname==="/api/health"){let database=false;try{await env.DB.prepare("SELECT 1").first();database=true}catch{}return json({ok:true,service:"Sieu-Sv_Library API",database})}

 if(url.pathname==="/api/github/script/history"&&request.method==="GET"){
  const folder=url.searchParams.get("path")||"";if(!safeManifestPath(folder))return json({error:"invalid_script_path"},400);
  try{const index=await githubIndex(request),record=index.records.find(x=>x.folder===folder);if(!record)return json({error:"script_not_found"},404);const commits=await githubApi("https://api.github.com/repos/"+REPO+"/commits?path="+encodeURIComponent(record.folder)+"/&per_page=12");if(!Array.isArray(commits))return json({error:"github_history_unavailable"},502);return json({versions:commits.map(c=>({sha:c.sha,message:String(c.commit?.message||"Repository update").slice(0,1000),date:c.commit?.author?.date||c.commit?.committer?.date||null,author:c.author?.login||c.commit?.author?.name||"contributor",url:c.html_url})).filter(x=>x.url)},200,{"Cache-Control":"public, max-age=120"})}catch{return json({error:"github_unavailable"},502)}
 }
 if(url.pathname==="/api/reports"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized",message:"Sign in to submit a report."},401);
  const parsedBody=await readJsonBody(request,6000);if(!parsedBody.ok)return json({error:parsedBody.error},parsedBody.status);const body=parsedBody.body;
  const reason=String(body.reason||"other"),details=String(body.details||"").trim(),scriptId=String(body.script_id||"").trim(),githubPath=String(body.github_path||"").trim();
  if(!["broken","unsafe","spam","copyright","other"].includes(reason))return json({error:"invalid_reason"},400);
  if(details.length<10||details.length>1000)return json({error:"invalid_details",message:"Details must contain 10 to 1000 characters."},400);
  if((!!scriptId)===(!!githubPath))return json({error:"invalid_target"},400);
  const token=typeof body.turnstileToken==="string"?body.turnstileToken:"";
  if(!env.TURNSTILE_SECRET_KEY)return json({error:"captcha_not_configured",message:"Report verification is temporarily unavailable."},503);
  if(!token||token.length>2048)return json({error:"captcha_required",message:"Complete the CAPTCHA before submitting a report."},400);
  let captcha;
  try{
   const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""}),
    signal:AbortSignal.timeout(10000)
   });
   if(!response.ok)return json({error:"captcha_unavailable",message:"CAPTCHA verification is temporarily unavailable. Try again."},503);
   captcha=await response.json();
  }catch{return json({error:"captcha_unavailable",message:"CAPTCHA verification is temporarily unavailable. Try again."},503)}
  if(captcha.success!==true||captcha.hostname!==url.hostname||captcha.action!=="report")return json({error:"captcha_failed",message:"CAPTCHA verification failed. Please try again."},403);
  let title="",targetId=null,targetPath=null;
  if(scriptId){if(scriptId.length>128)return json({error:"invalid_id"},400);const target=await env.DB.prepare("SELECT id,title FROM scripts WHERE id=? AND visibility='public' LIMIT 1").bind(scriptId).first();if(!target)return json({error:"script_not_found"},404);title=target.title;targetId=scriptId}
  else{if(!safeManifestPath(githubPath))return json({error:"invalid_script_path"},400);try{const index=await githubIndex(request),target=index.records.find(x=>x.folder===githubPath);if(!target)return json({error:"script_not_found"},404);title=target.title;targetPath=target.folder}catch{return json({error:"github_unavailable"},502)}}
  const duplicate=await env.DB.prepare("SELECT id FROM reports WHERE reporter_user_id=? AND script_id IS ? AND github_path IS ? AND status='open' AND created_at>=datetime('now','-1 day') LIMIT 1").bind(user.id,targetId,targetPath).first();if(duplicate)return json({error:"duplicate_report",message:"You have already reported this script recently."},409);
  const now=Math.floor(Date.now()/1000),rate=await env.DB.prepare("INSERT INTO report_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();
  if(!rate||rate.request_count>5)return json({error:"rate_limited",message:"Report limit reached. Try again later."},429,{"Retry-After":"3600"});
  try{const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO reports (id,reporter_user_id,script_id,github_path,script_title,reason,details,status) VALUES (?,?,?,?,?,?,?,'open')").bind(id,user.id,targetId,targetPath,title,reason,details).run();return json({ok:true,id,status:"open"},201)}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname==="/api/github/scripts"&&request.method==="GET"){try{const index=await githubIndex(request);return json({scripts:index.scripts,syncedAt:index.syncedAt},200,{"Cache-Control":"public, max-age=300"})}catch{return json({error:"github_unavailable"},502)}}
 if(url.pathname==="/api/github/script"&&request.method==="GET"){
  const path=url.searchParams.get("path")||"",id=url.searchParams.get("id")||"",file=url.searchParams.get("file");
  if(!path&&!id)return json({error:"script_path_required"},400);
  try{
   const index=await githubIndex(request);
   const record=index.records.find(x=>(id&&x.id===id)||(path&&(path===x.folder||path===x.manifestPath||path===x.folder+"/"+x.source||path.startsWith(x.folder+"/"))));
   if(!record)return json({error:"script_not_found"},404);
   const relative=file||record.source;
   if(!safeManifestPath(relative)||(!record.files.some(x=>x.path===relative)&&!record.importParts.includes(relative)))return json({error:"file_not_in_manifest"},404);
   const loaded=await githubFile(record.folder+"/"+relative,request);
   if(loaded.source===null)return json({error:loaded.status===404?"file_not_found":"github_temporarily_unavailable"},loaded.status);
   const script=index.scripts.find(x=>x.github_id===record.id);
   return json({kind:"GitHub",id:record.id,title:record.title,name:record.title,description:record.description,category:record.category,tag:record.tag,upload_method:record.method,method:record.method,thumbnail_url:record.thumbnail_url,repo_url:record.repo_url,path:record.folder+"/"+record.source,github_folder:record.folder,manifest_path:record.manifestPath,files:record.files,import_part_paths:record.importParts,import_parts:await Promise.all(record.importParts.slice(0,20).map(async part=>{const item=await githubFile(record.folder+"/"+part,request);return item.source===null?null:item.source})),selected_file:relative,source:loaded.source,author:script?.author||"minhReal",username:script?.username||"minhReal",avatar_url:script?.avatar_url||null,html_url:script?.html_url||null,added_by:script?.added_by||null,last_updated_by:script?.last_updated_by||null,initial_pr:script?.initial_pr||null,latest_pr:script?.latest_pr||null,pull_requests:script?.pull_requests||[],cached:!!loaded.stale},200,{"Cache-Control":"public, max-age=120"});
  }catch{return json({error:"github_unavailable"},502)}
 }
if(url.pathname.startsWith("/api/scripts/")&&url.pathname.includes("/versions")&&request.method==="GET"){
  const parts=url.pathname.split("/");if((parts.length!==5&&parts.length!==6)||parts[1]!=="api"||parts[2]!=="scripts"||parts[4]!=="versions"||(parts.length===6&&!/^[0-9]+$/.test(parts[5])))return json({error:"invalid_version_path"},400);
  const id=decodeURIComponent(parts[3]),versionNumber=parts.length===6?Number(parts[5]):null;if(!id||id.length>128)return json({error:"invalid_id"},400);
  try{const script=await env.DB.prepare("SELECT id FROM scripts WHERE id=? AND visibility='public' LIMIT 1").bind(id).first();if(!script)return json({error:"script_not_found"},404);
   if(versionNumber===null){const rows=await env.DB.prepare("SELECT v.version_number,v.title,v.changelog,v.created_at,u.username AS editor FROM script_versions v LEFT JOIN users u ON u.id=v.editor_user_id WHERE v.script_id=? ORDER BY v.version_number DESC LIMIT 50").bind(id).all();return json({versions:rows.results||[]})}
   const row=await env.DB.prepare("SELECT version_number,title,description,category,source,thumbnail_url,upload_method,import_parts,changelog,created_at FROM script_versions WHERE script_id=? AND version_number=? LIMIT 1").bind(id,versionNumber).first();if(!row)return json({error:"version_not_found"},404);try{row.import_parts=JSON.parse(row.import_parts||"[]");if(!Array.isArray(row.import_parts))row.import_parts=[]}catch{row.import_parts=[]}return json(row)
  }catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/scripts/")&&request.method==="GET"){const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);try{const row=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.thumbnail_url,s.created_at,s.updated_at,s.upload_method,s.import_parts,u.username,u.display_name,u.avatar_url,u.public_id FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.visibility='public' LIMIT 1").bind(id).first();if(!row)return json({error:"script_not_found"},404);const viewer=await currentUser(request,env),isOwner=!!(viewer&&viewer.id===row.user_id);const counts=await env.DB.prepare("SELECT SUM(CASE WHEN vote='like' THEN 1 ELSE 0 END) AS likes,SUM(CASE WHEN vote='dislike' THEN 1 ELSE 0 END) AS dislikes FROM script_votes WHERE script_id=?").bind(id).first();const ownVote=viewer?await env.DB.prepare("SELECT vote FROM script_votes WHERE script_id=? AND user_id=?").bind(id,viewer.id).first():null;delete row.user_id;try{row.import_parts=JSON.parse(row.import_parts||"[]");if(!Array.isArray(row.import_parts))row.import_parts=[]}catch{row.import_parts=[]}row.upload_method=["source","import","both"].includes(row.upload_method)?row.upload_method:"source";return json({...row,is_owner:isOwner,likes:Number(counts?.likes||0),dislikes:Number(counts?.dislikes||0),my_vote:ownVote?.vote||null,owner:row.display_name||row.username||"community",kind:"Community"})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="GET"){try{const q=(url.searchParams.get("q")||"").slice(0,100),viewer=await currentUser(request,env);const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.thumbnail_url,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url,u.public_id,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='like') AS likes,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='dislike') AS dislikes,(SELECT v.vote FROM script_votes v WHERE v.script_id=s.id AND v.user_id=? LIMIT 1) AS my_vote FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind(viewer?.id||null,"%"+q+"%","%"+q+"%").all();return json({scripts:rows.results||[]})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  const parsedBody=await readJsonBody(request,700000);if(!parsedBody.ok)return json({error:parsedBody.error},parsedBody.status);const body=parsedBody.body;
  const title=String(body.title||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,500),category=String(body.category||"Other").trim().slice(0,40),source=String(body.source||""),thumbnail=String(body.thumbnail_url||"").trim(),uploadMethod=String(body.upload_method||"source");
  let importParts=body.import_parts;
  if(!["source","import","both"].includes(uploadMethod))return json({error:"invalid_upload_method"},400);
  if(!Array.isArray(importParts))importParts=[];
  if(importParts.length>20||importParts.some(x=>typeof x!=="string"||!x.trim()||x.length>25000)||importParts.reduce((n,x)=>n+x.length,0)>200000)return json({error:"invalid_import_parts",message:"Import requires 1-20 non-empty parts, up to 25,000 characters each and 200,000 characters total."},400);
  if(title.length<2)return json({error:"invalid_title",message:"Title must contain 2 to 80 characters."},400);
  if(source.length>100000||(["source","both"].includes(uploadMethod)&&!source.trim()))return json({error:"invalid_source",message:"Source is required for Source and Both methods, up to 100000 characters."},400);
  if(uploadMethod==="import"||uploadMethod==="both"){if(!importParts.length)return json({error:"invalid_import_parts",message:"Add at least one import part."},400)}else importParts=[];
  if(thumbnail&&thumbnail.length>250000)return json({error:"invalid_thumbnail",message:"Thumbnail image is too large."},400);
  if(thumbnail&&!(/^https:\/\//i.test(thumbnail)&&thumbnail.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(thumbnail))return json({error:"invalid_thumbnail",message:"Thumbnail must be an HTTPS URL or a supported uploaded image."},400);
  if(!env.TURNSTILE_SECRET_KEY)return json({error:"captcha_not_configured",message:"Upload verification is temporarily unavailable."},503);
  const token=typeof body.turnstileToken==="string"?body.turnstileToken:"";
  if(!token||token.length>2048)return json({error:"captcha_required"},400);
  let captcha;
  try{
   const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""}),
    signal:AbortSignal.timeout(10000)
   });
   if(!verify.ok)return json({error:"captcha_unavailable",message:"Upload verification is temporarily unavailable. Try again."},503);
   captcha=await verify.json();
  }catch{return json({error:"captcha_unavailable",message:"Upload verification is temporarily unavailable. Try again."},503)}
  if(captcha.success!==true||captcha.hostname!==url.hostname||captcha.action!=="upload")return json({error:"captcha_failed"},403);
  const now=Math.floor(Date.now()/1000);
  const rate=await env.DB.prepare("INSERT INTO upload_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();
  if(!rate||rate.request_count>5)return json({error:"rate_limited",message:"Upload limit reached. Try again later."},429,{"Retry-After":"3600"});
  const id=crypto.randomUUID();
  try{await env.DB.batch([env.DB.prepare("INSERT INTO scripts (id,user_id,title,description,category,source,thumbnail_url,visibility,upload_method,import_parts) VALUES (?,?,?,?,?,?,?, 'public',?,?)").bind(id,user.id,title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts)),env.DB.prepare("INSERT INTO script_versions (id,script_id,version_number,title,description,category,source,thumbnail_url,upload_method,import_parts,changelog,editor_user_id) VALUES (?,?,1,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts),"Initial release",user.id)]);return json({ok:true,id,url:origin+"/script?id="+encodeURIComponent(id),version_number:1},201)}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/scripts/")&&url.pathname.endsWith("/vote")&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized",message:"Sign in with Google to vote."},401);
  const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length,-"/vote".length));if(!id||id.length>128)return json({error:"invalid_id"},400);
  const parsedBody=await readJsonBody(request,1024);if(!parsedBody.ok)return json({error:parsedBody.error},parsedBody.status);const body=parsedBody.body;
  const vote=body.vote;if(vote!=="like"&&vote!=="dislike")return json({error:"invalid_vote"},400);
  const script=await env.DB.prepare("SELECT id FROM scripts WHERE id=? AND visibility='public' LIMIT 1").bind(id).first();if(!script)return json({error:"script_not_found"},404);
  const now=Math.floor(Date.now()/1000),voteRate=await env.DB.prepare("INSERT INTO vote_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();if(!voteRate||voteRate.request_count>60)return json({error:"vote_rate_limited",message:"Vote limit reached. Try again later."},429,{"Retry-After":"3600"});
  const previous=await env.DB.prepare("SELECT vote FROM script_votes WHERE script_id=? AND user_id=?").bind(id,user.id).first();
  if(previous?.vote===vote)await env.DB.prepare("DELETE FROM script_votes WHERE script_id=? AND user_id=?").bind(id,user.id).run();
  else await env.DB.prepare("INSERT INTO script_votes (script_id,user_id,vote) VALUES (?,?,?) ON CONFLICT(script_id,user_id) DO UPDATE SET vote=excluded.vote,created_at=CURRENT_TIMESTAMP").bind(id,user.id,vote).run();
  const counts=await env.DB.prepare("SELECT SUM(CASE WHEN vote='like' THEN 1 ELSE 0 END) AS likes,SUM(CASE WHEN vote='dislike' THEN 1 ELSE 0 END) AS dislikes FROM script_votes WHERE script_id=?").bind(id).first();
  const current=await env.DB.prepare("SELECT vote FROM script_votes WHERE script_id=? AND user_id=?").bind(id,user.id).first();
  return json({ok:true,likes:Number(counts?.likes||0),dislikes:Number(counts?.dislikes||0),my_vote:current?.vote||null});
 }
 if(url.pathname.startsWith("/api/scripts/")&&request.method==="PUT"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128||id.includes("/"))return json({error:"invalid_id"},400);
  const parsedBody=await readJsonBody(request,700000);if(!parsedBody.ok)return json({error:parsedBody.error},parsedBody.status);const body=parsedBody.body;
  const existing=await env.DB.prepare("SELECT title,description,category,source,thumbnail_url,upload_method,import_parts FROM scripts WHERE id=? AND user_id=? LIMIT 1").bind(id,user.id).first();if(!existing)return json({error:"script_not_found_or_forbidden"},404);
  const title=String(body.title||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,500),category=String(body.category||"Other").trim().slice(0,40),uploadMethod=String(body.upload_method??existing.upload_method??"source"),source=String(body.source??existing.source??"");
  let importParts=body.import_parts;if(importParts===undefined){try{importParts=JSON.parse(existing.import_parts||"[]")}catch{importParts=[]}}
  if(!Array.isArray(importParts))return json({error:"invalid_import_parts"},400);
  if(!["source","import","both"].includes(uploadMethod))return json({error:"invalid_upload_method"},400);
  if(importParts.length>20||importParts.some(x=>typeof x!=="string"||!x.trim()||x.length>25000)||importParts.reduce((n,x)=>n+x.length,0)>200000)return json({error:"invalid_import_parts",message:"Import requires 1-20 non-empty parts, up to 25,000 characters each and 200,000 characters total."},400);
  if(title.length<2)return json({error:"invalid_title",message:"Title must contain 2 to 80 characters."},400);
  if(source.length>100000||(["source","both"].includes(uploadMethod)&&!source.trim()))return json({error:"invalid_source",message:"Source is required for Source and Both methods, up to 100000 characters."},400);
  if(uploadMethod==="import"||uploadMethod==="both"){if(!importParts.length)return json({error:"invalid_import_parts",message:"Add at least one String Import Part."},400)}else importParts=[];
  let thumbnail=existing.thumbnail_url||"";if(Object.prototype.hasOwnProperty.call(body,"thumbnail_url")&&body.thumbnail_url!==null)thumbnail=String(body.thumbnail_url||"").trim();
  if(thumbnail&&thumbnail.length>250000)return json({error:"invalid_thumbnail"},400);
  if(thumbnail&&!(/^https:\/\//i.test(thumbnail)&&thumbnail.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(thumbnail))return json({error:"invalid_thumbnail"},400);
  const maxRow=await env.DB.prepare("SELECT COALESCE(MAX(version_number),0) AS max_version FROM script_versions WHERE script_id=?").bind(id).first(),hasHistory=Number(maxRow?.max_version||0)>0,nextVersion=Number(maxRow?.max_version||0)+(Number(maxRow?.max_version||0)>0?1:2),changelog=String(body.changelog||"").trim().slice(0,300)||"Updated script";
  const commands=[];
  if(!hasHistory)commands.push(env.DB.prepare("INSERT INTO script_versions (id,script_id,version_number,title,description,category,source,thumbnail_url,upload_method,import_parts,changelog,editor_user_id) VALUES (?,?,1,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,existing.title,existing.description||"",existing.category||"Other",existing.source||"",existing.thumbnail_url||null,existing.upload_method||"source",existing.import_parts||"[]","History tracking started",user.id));
  commands.push(env.DB.prepare("UPDATE scripts SET title=?,description=?,category=?,source=?,thumbnail_url=?,upload_method=?,import_parts=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?").bind(title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts),id,user.id));
  commands.push(env.DB.prepare("INSERT INTO script_versions (id,script_id,version_number,title,description,category,source,thumbnail_url,upload_method,import_parts,changelog,editor_user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,nextVersion,title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts),changelog,user.id));
  try{const results=await env.DB.batch(commands);if(!results[hasHistory?0:1]?.meta?.changes)return json({error:"script_not_found_or_forbidden"},404);return json({ok:true,id,upload_method:uploadMethod,import_parts:importParts,version_number:nextVersion})}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/profile/")&&request.method==="GET"){
  const publicId=decodeURIComponent(url.pathname.slice("/api/profile/".length));if(!/^[a-f0-9]{16}$/.test(publicId))return json({error:"profile_not_found"},404);
  const user=await env.DB.prepare("SELECT id,public_id,username,display_name,avatar_url,bio,created_at FROM users WHERE public_id=? LIMIT 1").bind(publicId).first();if(!user)return json({error:"profile_not_found"},404);const viewer=await currentUser(request,env);
  const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.thumbnail_url,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url,u.public_id,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='like') AS likes,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='dislike') AS dislikes,(SELECT v.vote FROM script_votes v WHERE v.script_id=s.id AND v.user_id=? LIMIT 1) AS my_vote FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.user_id=? AND s.visibility='public' ORDER BY s.created_at DESC LIMIT 50").bind(viewer?.id||null,user.id).all();
  const history=await env.DB.prepare("SELECT username,changed_at FROM username_history WHERE user_id=? ORDER BY changed_at DESC LIMIT 50").bind(user.id).all();delete user.id;
  return json({user,scripts:rows.results||[],username_history:history.results||[]});
 }
 if(url.pathname==="/script"||url.pathname.startsWith("/script/")||url.pathname==="/script.html"){
  const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/script.html?__fresh="+Date.now(),{headers:{"cache-control":"no-cache","user-agent":"Sieu-Sv_Library"}});
  if(!page.ok)return new Response("Script page source not found",{status:502});
  let html=await page.text();
  html=html.split('href="index.html"').join('href="'+SITE+'/"');
  html=html.split("href='index.html'").join("href='"+SITE+"/'");
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
 }
 if(url.pathname==="/"||["/home","/explore","/upload","/settings","/profile"].includes(url.pathname)||(url.pathname.startsWith("/profile/")&&/^[a-f0-9]{16}$/.test(url.pathname.slice(9)))){
  const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/index.html?__fresh="+Date.now(),{headers:{"cache-control":"no-cache","user-agent":"Sieu-Sv_Library"}});
  if(!page.ok)return new Response("Website source not found",{status:502});
  let html=await page.text();
  html=html.split("PAGE_BASE='https://minhreal.github.io/SieuSV-Storage/'").join("PAGE_BASE=APP_BASE+'/'");
  html=html.split("PAGE_BASE+'script.html").join("APP_BASE+'/script");
  html=html.split("https://minhreal.github.io/SieuSV-Storage/script.html").join(SITE+"/script");
  html=html.split("https://minhreal.github.io/SieuSV-Storage/").join(SITE+"/");
  return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store"}});
 }
 return json({error:"not_found"},404)
}
async function secureResponse(response){
 const headers=new Headers(response.headers);
 headers.set("X-Content-Type-Options","nosniff");
 headers.set("X-Frame-Options","DENY");
 headers.set("Referrer-Policy","strict-origin-when-cross-origin");
 headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=(), payment=()");
 headers.set("Strict-Transport-Security","max-age=31536000");
 headers.set("Cross-Origin-Opener-Policy","same-origin-allow-popups");
 headers.set("X-DNS-Prefetch-Control","off");
 let body=response.body;
 const type=headers.get("content-type")||"";
 if(type.includes("text/html")){
  const html=await response.text(),hashes=[];
  for(const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)){
   if(!match[1].trim())continue;
   const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(match[1]));
   hashes.push("'sha256-"+btoa(String.fromCharCode(...new Uint8Array(digest)))+"'");
  }
  const scriptPolicy=["'self'","https://challenges.cloudflare.com",...hashes].join(" ");
  headers.set("Content-Security-Policy","default-src 'self'; script-src "+scriptPolicy+"; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; form-action 'self' https://accounts.google.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests");
  headers.set("Cache-Control","no-store");
  body=html;
 }else if(!headers.has("Content-Security-Policy")){
  headers.set("Content-Security-Policy","default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
 }
 return new Response(body,{status:response.status,statusText:response.statusText,headers});
}
export default {async fetch(request,env){
 try{
  const response=await secureResponse(await handle(request,env));
  const origin=request.headers.get("Origin")||"";
  const path=new URL(request.url).pathname;
  if(origin===PAGES_ORIGIN&&path.startsWith("/api/")){
   const headers=new Headers(response.headers);
   headers.set("Access-Control-Allow-Origin",PAGES_ORIGIN);
   headers.set("Access-Control-Allow-Methods","GET, OPTIONS");
   headers.set("Access-Control-Allow-Headers","Content-Type");
   headers.set("Access-Control-Max-Age","86400");
   headers.append("Vary","Origin");
   return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
  return response;
 }catch(error){return await secureResponse(json({error:"internal_error"},500))}
}};