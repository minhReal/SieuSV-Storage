const REPO="minhReal/SieuSV-Storage";
const SITE="https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev";
const COOKIE="ssv_session";
const STATE_COOKIE="ssv_oauth_state";
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/=/g,"").replaceAll("+","-").replaceAll("/","_");
const unb64u=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
const cookie=(name,value,maxAge)=>name+"="+value+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+maxAge;
function getCookie(req,name){return (req.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(name+"="))?.slice(name.length+1)||""}
async function sign(value,secret){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return b64u(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value)))}
async function makeSession(sub,secret){const payload=b64u(new TextEncoder().encode(JSON.stringify({sub,exp:Math.floor(Date.now()/1000)+604800})));return payload+"."+await sign(payload,secret)}
function constantTimeEqual(a,b){if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
async function readSession(req,secret){try{const [p,s]=getCookie(req,COOKIE).split(".");if(!p||!s||!secret)return null;const expected=await sign(p,secret);if(!constantTimeEqual(s,expected))return null;const v=JSON.parse(new TextDecoder().decode(unb64u(p)));return v&&typeof v.sub==="string"&&v.exp>Date.now()/1000?v:null}catch{return null}}
async function githubFile(path,request){
 if(!path||path.length>500||path.split("/").some(p=>!p||p==="."||p===".."))return {status:400,source:null};
 const cacheKey=new Request(new URL("/__github_cache/"+encodeURIComponent(path),request.url));
 const cache= caches.default;
 let cached=null;
 try{cached=await cache.match(cacheKey)}catch{}
 try{
  const upstream="https://raw.githubusercontent.com/"+REPO+"/main/"+path.split("/").map(encodeURIComponent).join("/");
  let r;
  for(let attempt=0;attempt<2;attempt++){
   try{r=await fetch(upstream,{headers:{"user-agent":"Sieu-Sv_Library"}});if(r.ok||r.status===404||r.status===403)break}catch{}
  }
  if(r?.ok){
   const source=await r.text();
   try{await cache.put(cacheKey,new Response(source,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}}))}catch{}
   return {status:200,source};
  }
  if(r?.status===404)return {status:404,source:null};
  if(cached)return {status:200,source:await cached.text(),stale:true};
  return {status:503,source:null};
 }catch{
  if(cached){try{return {status:200,source:await cached.text(),stale:true}}catch{}}
  return {status:503,source:null};
 }
}
async function currentUser(req,env){const session=await readSession(req,env.gg_secret);if(!session)return null;return await env.DB.prepare("SELECT id,public_id,username,display_name,avatar_url,bio,created_at,username_updated_at FROM users WHERE google_sub=? LIMIT 1").bind(session.sub).first()}
async function handle(request,env){
 const url=new URL(request.url),origin=SITE;
 if((request.method==="POST"||request.method==="PUT")&&(["/auth/logout","/api/me/profile","/api/scripts"].includes(url.pathname)||(request.method==="PUT"&&url.pathname.startsWith("/api/scripts/")))){
  if(request.headers.get("Origin")!==url.origin||request.headers.get("Sec-Fetch-Site")==="cross-site")return json({error:"csrf_rejected"},403);
  if(url.pathname!=="/auth/logout"&&!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")||""))return json({error:"json_required"},415);
 }
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"Allow":"GET, POST, OPTIONS"}});
 if(url.pathname==="/auth/google"&&request.method==="GET"){
  if(!env.GOOGLE_CLIENT_ID||!env.gg_secret)return json({error:"oauth_not_configured",message:"Missing GOOGLE_CLIENT_ID or gg_secret."},503);
  const state=b64u(crypto.getRandomValues(new Uint8Array(32)));
  const redirect=origin+"/auth/google/callback";
  const google=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  google.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:redirect,response_type:"code",scope:"openid email profile",state,access_type:"online",prompt:"select_account"}).toString();
  return new Response(null,{status:302,headers:{Location:google.toString(),"Set-Cookie":cookie(STATE_COOKIE,state,600),"Cache-Control":"no-store"}});
 }
 if(url.pathname==="/auth/google/callback"&&request.method==="GET"){
  const state=url.searchParams.get("state")||"",saved=getCookie(request,STATE_COOKIE),code=url.searchParams.get("code");
  if(!state||!saved||state!==saved||!code)return new Response("OAuth state invalid or login cancelled.",{status:400});
  const tokenRes=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({code,client_id:env.GOOGLE_CLIENT_ID,client_secret:env.gg_secret,redirect_uri:origin+"/auth/google/callback",grant_type:"authorization_code"})});
  const token=await tokenRes.json();
  if(!tokenRes.ok||!token.access_token)return new Response("Google token exchange failed. Check OAuth Client ID, gg_secret and redirect URI.",{status:502});
  const userRes=await fetch("https://www.googleapis.com/oauth2/v3/userinfo",{headers:{authorization:"Bearer "+token.access_token}});
  const profile=await userRes.json();
  if(!userRes.ok||!profile.sub||!profile.email_verified)return new Response("Google account could not be verified.",{status:401});
  const old=await env.DB.prepare("SELECT id,public_id,username FROM users WHERE google_sub=? LIMIT 1").bind(profile.sub).first();
  let username=old?.username;
  if(!username){const base=(profile.email.split("@")[0]||"user").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,20)||"user";username=base+"_"+crypto.randomUUID().slice(0,6)}
  const id=old?.id||profile.sub;
  await env.DB.prepare("INSERT INTO users (id,google_sub,username,display_name,avatar_url,public_id) VALUES (?,?,?,?,?,?) ON CONFLICT(google_sub) DO UPDATE SET display_name=excluded.display_name,avatar_url=excluded.avatar_url").bind(id,profile.sub,username,profile.name||username,profile.picture||"",old?.public_id||crypto.randomUUID().replaceAll("-","").slice(0,16)).run();
  const session=await makeSession(profile.sub,env.gg_secret);
  const headers=new Headers({Location:origin+"/?login=success","Cache-Control":"no-store"});headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(STATE_COOKIE,"",0));return new Response(null,{status:302,headers});
 }
 if(url.pathname==="/auth/logout"&&request.method==="POST")return json({ok:true},200,{"Set-Cookie":cookie(COOKIE,"",0)});
 if(url.pathname==="/api/me"&&request.method==="GET"){const user=await currentUser(request,env);return json({user})}
 if(url.pathname==="/api/me/profile"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>370000)return json({error:"payload_too_large",message:"Profile image is too large."},413);const raw=await request.text();if(raw.length>370000)return json({error:"payload_too_large",message:"Profile image is too large."},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
  const username=String(body.username??user.username??"").trim().toLowerCase(),display=String(body.display_name??user.display_name??"").trim(),bio=String(body.bio??user.bio??"").trim(),avatar=String(body.avatar_url??user.avatar_url??"").trim();
  if(!/^[a-z0-9_]{3,20}$/.test(username))return json({error:"invalid_username",message:"Username must be 3-20 characters and use only lowercase letters, numbers or underscores."},400);
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
  if(usernameChanged&&row?.username_updated_at&&now-row.username_updated_at<259200)return json({error:"username_cooldown",message:"You can change your username once every 3 days."},429,{"Retry-After":String(259200-(now-row.username_updated_at))});
  if(displayChanged&&row?.display_name_updated_at&&now-row.display_name_updated_at<604800)return json({error:"display_name_cooldown",message:"You can change your display name once every 7 days."},429,{"Retry-After":String(604800-(now-row.display_name_updated_at))});
  try{
   await env.DB.prepare("UPDATE users SET username=?,display_name=?,bio=?,avatar_url=?,username_updated_at=CASE WHEN ? THEN ? ELSE username_updated_at END,display_name_updated_at=CASE WHEN ? THEN ? ELSE display_name_updated_at END WHERE id=?").bind(username,display,bio,avatar,usernameChanged?1:0,now,displayChanged?1:0,now,user.id).run();
  }catch{return json({error:"username_taken",message:"That username is already in use. Choose another one."},409)}
  return json({ok:true,user:await currentUser(request,env)});
 }
 if(url.pathname==="/api/health"){let database=false;try{await env.DB.prepare("SELECT 1").first();database=true}catch{}return json({ok:true,service:"Sieu-Sv_Library API",database})}
 if(url.pathname==="/api/github/scripts"){const r=await fetch("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1",{headers:{"accept":"application/vnd.github+json","user-agent":"Sieu-Sv_Library"}});if(!r.ok)return json({error:"github_unavailable"},502);const data=await r.json();const scripts=(data.tree||[]).filter(x=>x.type==="blob"&&x.path.toLowerCase().endsWith(".lua")).map(x=>({path:x.path,name:x.path.split("/").pop().replace(/\\.lua$/i,""),title:x.path.split("/").pop().replace(/\\.lua$/i,""),author:"minhReal",username:"minhReal",category:"GitHub",url:"https://raw.githubusercontent.com/"+REPO+"/main/"+x.path.split("/").map(encodeURIComponent).join("/"),description:"Lua script from the Sieu-Sv_Library repository"}));return json({scripts,syncedAt:new Date().toISOString()})}
 if(url.pathname==="/api/github/script"&&request.method==="GET"){const path=url.searchParams.get("path")||"";if(!path.toLowerCase().endsWith(".lua"))return json({error:"invalid_script_path"},400);const result=await githubFile(path,request);if(result.source===null)return json({error:result.status===404?"script_not_found":"github_temporarily_unavailable",message:result.status===404?"Script does not exist in the repository.":"GitHub is temporarily unavailable and no cached copy exists."},result.status);const title=path.split("/").pop().replace(/\\.lua$/i,"");return json({title,name:title,source:result.source,path,description:"Lua script from the Sieu-Sv_Library repository",category:"GitHub",author:"minhReal",username:"minhReal",kind:"GitHub",cached:!!result.stale})}
 if(url.pathname.startsWith("/api/scripts/")&&request.method==="GET"){const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);try{const row=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.thumbnail_url,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.visibility='public' LIMIT 1").bind(id).first();if(!row)return json({error:"script_not_found"},404);return json({...row,owner:row.display_name||row.username||"community",kind:"Community"})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="GET"){try{const q=(url.searchParams.get("q")||"").slice(0,100);const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.thumbnail_url,s.created_at,s.updated_at,u.username FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind("%"+q+"%","%"+q+"%").all();return json({scripts:rows.results||[]})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>450000)return json({error:"payload_too_large"},413);const raw=await request.text();if(raw.length>450000)return json({error:"payload_too_large"},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
  const title=String(body.title||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,500),category=String(body.category||"Other").trim().slice(0,40),source=String(body.source||""),thumbnail=String(body.thumbnail_url||"").trim();
  if(title.length<2)return json({error:"invalid_title",message:"Title must contain 2 to 80 characters."},400);
  if(source.length<1||source.length>100000)return json({error:"invalid_source",message:"Source must be between 1 and 100000 characters."},400);
  if(thumbnail&&thumbnail.length>250000)return json({error:"invalid_thumbnail",message:"Thumbnail image is too large."},400);
  if(thumbnail&&!(/^https:\/\//i.test(thumbnail)&&thumbnail.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(thumbnail))return json({error:"invalid_thumbnail",message:"Thumbnail must be an HTTPS URL or a supported uploaded image."},400);
  if(env.TURNSTILE_SECRET_KEY){
   const token=String(body.turnstileToken||"");if(!token||token.length>2048)return json({error:"captcha_required"},400);
   const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""})});
   const result=await verify.json();if(!result.success||result.hostname!==url.hostname)return json({error:"captcha_failed"},403);
  }
  const now=Math.floor(Date.now()/1000);
  const rate=await env.DB.prepare("INSERT INTO upload_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();
  if(!rate||rate.request_count>5)return json({error:"rate_limited",message:"Upload limit reached. Try again later."},429,{"Retry-After":"3600"});
  const id=crypto.randomUUID();
  try{await env.DB.prepare("INSERT INTO scripts (id,user_id,title,description,category,source,thumbnail_url,visibility) VALUES (?,?,?,?,?,?,?, 'public')").bind(id,user.id,title,description,category,source,thumbnail||null).run();return json({ok:true,id,url:origin+"/script?id="+encodeURIComponent(id)},201)}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/scripts/")&&request.method==="PUT"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>450000)return json({error:"payload_too_large"},413);const raw=await request.text();if(raw.length>450000)return json({error:"payload_too_large"},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
  const title=String(body.title||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,500),category=String(body.category||"Other").trim().slice(0,40),source=String(body.source||""),thumbnail=String(body.thumbnail_url||"").trim();
  if(title.length<2)return json({error:"invalid_title",message:"Title must contain 2 to 80 characters."},400);
  if(source.length<1||source.length>100000)return json({error:"invalid_source",message:"Source must be between 1 and 100000 characters."},400);
  if(thumbnail&&thumbnail.length>250000)return json({error:"invalid_thumbnail"},400);
  if(thumbnail&&!(/^https:\/\//i.test(thumbnail)&&thumbnail.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(thumbnail))return json({error:"invalid_thumbnail"},400);
  try{const result=await env.DB.prepare("UPDATE scripts SET title=?,description=?,category=?,source=?,thumbnail_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?").bind(title,description,category,source,thumbnail||null,id,user.id).run();if(!result.meta?.changes)return json({error:"script_not_found_or_forbidden"},404);return json({ok:true,id})}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/profile/")&&request.method==="GET"){
  const publicId=decodeURIComponent(url.pathname.slice("/api/profile/".length));if(!/^[a-f0-9]{16}$/.test(publicId))return json({error:"profile_not_found"},404);
  const user=await env.DB.prepare("SELECT public_id,username,display_name,avatar_url,bio,created_at FROM users WHERE public_id=? LIMIT 1").bind(publicId).first();if(!user)return json({error:"profile_not_found"},404);
  const rows=await env.DB.prepare("SELECT id,title,description,category,created_at FROM scripts WHERE user_id=(SELECT id FROM users WHERE public_id=?) AND visibility='public' ORDER BY created_at DESC LIMIT 50").bind(publicId).all();
  return json({user,scripts:rows.results||[]});
 }
 if(url.pathname==="/script"||url.pathname.startsWith("/script/")){const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/script.html");if(!page.ok)return new Response("Script page source not found",{status:502});return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}})}
 if(url.pathname==="/"||["/home","/explore","/upload","/settings","/profile"].includes(url.pathname)||/^\/profile\/[a-f0-9]{16}$/.test(url.pathname)){
  const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/index.html");if(!page.ok)return new Response("Website source not found",{status:502});return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}});
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
 try{return await secureResponse(await handle(request,env))}
 catch(error){return await secureResponse(json({error:"internal_error"},500))}
}};