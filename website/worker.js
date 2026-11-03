const REPO="minhReal/SieuSV-Storage";
const SITE="https://sieu-sv-library-api.sieusv-storage-minhreal.workers.dev";
const PAGES_ORIGIN="https://minhreal.github.io";
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
 if(!safeManifestPath(path)||path.length>500)return {status:400,source:null};
 const cacheKey=new Request(new URL("/__github_cache_v3/"+encodeURIComponent(path),request.url));
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
   try{await cache.put(cacheKey,new Response(source,{headers:{"content-type":"text/plain; charset=utf-8","cache-control":"public, max-age=3600"}}))}catch{}
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
function safeManifestPath(value){return typeof value==="string"&&value.length>0&&value.length<300&&!value.startsWith("/")&&!value.includes("\\")&&!/[?#\\u0000-\\u001f\\u007f]/.test(value)&&!value.split("/").some(p=>!p||p==="."||p==="..")}
async function githubIndex(request){
 const key=new Request(new URL("/__github_manifest_index_v2",request.url)),cache=caches.default;
 try{const cached=await cache.match(key);if(cached)return await cached.json()}catch{}
 const tree=await githubApi("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1&svs=2");
 if(!tree||!Array.isArray(tree.tree))throw new Error("github_tree_unavailable");
 const treeFiles=new Set(tree.tree.filter(x=>x.type==="blob").map(x=>x.path));
 const manifestPaths=tree.tree.filter(x=>x.type==="blob"&&(x.path.split("/").pop()==="SVS.json"||x.path.split("/").pop()==="svs.json")).map(x=>x.path),records=[];
 await Promise.all(manifestPaths.map(async manifestPath=>{
  const folder=manifestPath.slice(0,manifestPath.lastIndexOf("/")),raw=await githubFile(manifestPath,request);
  if(!raw.source)return;
  let manifest;try{manifest=JSON.parse(raw.source)}catch{return}
  if(!manifest||typeof manifest!=="object"||Array.isArray(manifest)||raw.source.length>65536)return;
  const listed=[];
  for(const entry of Array.isArray(manifest.files)?manifest.files:[]){
   const rel=typeof entry==="string"?entry:entry?.path;
   if(!safeManifestPath(rel)||!treeFiles.has(folder+"/"+rel))continue;
   if(!listed.some(x=>x.path===rel))listed.push({path:rel,role:typeof entry==="object"&&typeof entry.role==="string"?entry.role:"file"});
  }
  const importParts=(Array.isArray(manifest.import_parts)?manifest.import_parts:[]).filter(safeManifestPath).filter(x=>treeFiles.has(folder+"/"+x));
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
  records.push({id,folder,manifestPath,manifest:{...manifest},title:String(manifest.title||id).slice(0,100),description:String(manifest.description||"").slice(0,1000),category:(String(manifest.category||"Other").trim()==="Studio Tools"?"Plugins":String(manifest.category||"Other")).slice(0,60),tag:String(typeof manifest.tag==="string"&&manifest.tag.trim()?manifest.tag.trim():"Github").slice(0,48),method,source:sourcePath,files:listed,importParts,thumbnail_url:thumb||"https://raw.githubusercontent.com/"+REPO+"/main/logo2.jpg",repo_url:"https://github.com/"+REPO+"/tree/main/"+folder.split("/").map(encodeURIComponent).join("/")});
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

async function currentUser(req,env){const session=await readSession(req,env.gg_secret);if(!session)return null;return await env.DB.prepare("SELECT id,public_id,username,display_name,avatar_url,bio,created_at,username_updated_at FROM users WHERE google_sub=? LIMIT 1").bind(session.sub).first()}
async function handle(request,env){
 const url=new URL(request.url),origin=SITE;
 if((request.method==="POST"||request.method==="PUT")&&(["/auth/logout","/api/me/profile","/api/scripts"].includes(url.pathname)||(request.method==="POST"&&/^\/api\/scripts\/[^/]+\/vote$/.test(url.pathname))||(request.method==="PUT"&&url.pathname.startsWith("/api/scripts/")))){
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
  if(!state||!saved||!constantTimeEqual(state,saved)||!code)return new Response("OAuth state invalid or login cancelled.",{status:400});
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
  await env.DB.prepare("INSERT INTO users (id,google_sub,username,display_name,avatar_url,public_id) VALUES (?,?,?,?,?,?) ON CONFLICT(google_sub) DO NOTHING").bind(id,profile.sub,username,profile.name||username,profile.picture||"",old?.public_id||crypto.randomUUID().replaceAll("-","").slice(0,16)).run();
  const session=await makeSession(profile.sub,env.gg_secret);
  const headers=new Headers({Location:origin+"/?login=success","Cache-Control":"no-store"});headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(STATE_COOKIE,"",0));return new Response(null,{status:302,headers});
 }
 if(url.pathname==="/auth/logout"&&request.method==="POST")return json({ok:true},200,{"Set-Cookie":cookie(COOKIE,"",0)});
 if(url.pathname==="/api/me"&&request.method==="GET"){const user=await currentUser(request,env);if(user)delete user.id;return json({user})}
 if(url.pathname==="/api/me/profile"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>370000)return json({error:"payload_too_large",message:"Profile image is too large."},413);const raw=await request.text();if(raw.length>370000)return json({error:"payload_too_large",message:"Profile image is too large."},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
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
  const updatedUser=await currentUser(request,env);if(updatedUser)delete updatedUser.id;return json({ok:true,user:updatedUser});
 }
 if(url.pathname==="/api/health"){let database=false;try{await env.DB.prepare("SELECT 1").first();database=true}catch{}return json({ok:true,service:"Sieu-Sv_Library API",database})}
 
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
if(url.pathname.startsWith("/api/scripts/")&&request.method==="GET"){const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);try{const row=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.thumbnail_url,s.created_at,s.updated_at,s.upload_method,s.import_parts,u.username,u.display_name,u.avatar_url,u.public_id FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.visibility='public' LIMIT 1").bind(id).first();if(!row)return json({error:"script_not_found"},404);const viewer=await currentUser(request,env),isOwner=!!(viewer&&viewer.id===row.user_id);const counts=await env.DB.prepare("SELECT SUM(CASE WHEN vote='like' THEN 1 ELSE 0 END) AS likes,SUM(CASE WHEN vote='dislike' THEN 1 ELSE 0 END) AS dislikes FROM script_votes WHERE script_id=?").bind(id).first();const ownVote=viewer?await env.DB.prepare("SELECT vote FROM script_votes WHERE script_id=? AND user_id=?").bind(id,viewer.id).first():null;delete row.user_id;try{row.import_parts=JSON.parse(row.import_parts||"[]");if(!Array.isArray(row.import_parts))row.import_parts=[]}catch{row.import_parts=[]}row.upload_method=["source","import","both"].includes(row.upload_method)?row.upload_method:"source";return json({...row,is_owner:isOwner,likes:Number(counts?.likes||0),dislikes:Number(counts?.dislikes||0),my_vote:ownVote?.vote||null,owner:row.display_name||row.username||"community",kind:"Community"})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="GET"){try{const q=(url.searchParams.get("q")||"").slice(0,100),viewer=await currentUser(request,env);const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.thumbnail_url,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url,u.public_id,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='like') AS likes,(SELECT COUNT(*) FROM script_votes v WHERE v.script_id=s.id AND v.vote='dislike') AS dislikes,(SELECT v.vote FROM script_votes v WHERE v.script_id=s.id AND v.user_id=? LIMIT 1) AS my_vote FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind(viewer?.id||null,"%"+q+"%","%"+q+"%").all();return json({scripts:rows.results||[]})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized"},401);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>700000)return json({error:"payload_too_large"},413);const raw=await request.text();if(raw.length>700000)return json({error:"payload_too_large"},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
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
  if(env.TURNSTILE_SECRET_KEY){
   const token=String(body.turnstileToken||"");if(!token||token.length>2048)return json({error:"captcha_required"},400);
   const verify=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:token,remoteip:request.headers.get("CF-Connecting-IP")||""})});
   const result=await verify.json();if(!result.success||result.hostname!==url.hostname)return json({error:"captcha_failed"},403);
  }
  const now=Math.floor(Date.now()/1000);
  const rate=await env.DB.prepare("INSERT INTO upload_rate_limits (user_id,window_start,request_count) VALUES (?, ?, 1) ON CONFLICT(user_id) DO UPDATE SET request_count=CASE WHEN window_start<=?-3600 THEN 1 ELSE request_count+1 END,window_start=CASE WHEN window_start<=?-3600 THEN ? ELSE window_start END RETURNING request_count").bind(user.id,now,now,now,now).first();
  if(!rate||rate.request_count>5)return json({error:"rate_limited",message:"Upload limit reached. Try again later."},429,{"Retry-After":"3600"});
  const id=crypto.randomUUID();
  try{await env.DB.prepare("INSERT INTO scripts (id,user_id,title,description,category,source,thumbnail_url,visibility,upload_method,import_parts) VALUES (?,?,?,?,?,?,?, 'public',?,?)").bind(id,user.id,title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts)).run();return json({ok:true,id,url:origin+"/script?id="+encodeURIComponent(id)},201)}catch{return json({error:"database_error"},500)}
 }
 if(url.pathname.startsWith("/api/scripts/")&&url.pathname.endsWith("/vote")&&request.method==="POST"){
  const user=await currentUser(request,env);if(!user)return json({error:"unauthorized",message:"Sign in with Google to vote."},401);
  const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length,-"/vote".length));if(!id||id.length>128)return json({error:"invalid_id"},400);
  let body;try{const length=Number(request.headers.get("content-length")||0);if(length>1024)return json({error:"payload_too_large"},413);const raw=await request.text();if(raw.length>1024)return json({error:"payload_too_large"},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
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
  const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);
  let body;try{const size=Number(request.headers.get("content-length")||0);if(size>700000)return json({error:"payload_too_large"},413);const raw=await request.text();if(raw.length>700000)return json({error:"payload_too_large"},413);body=JSON.parse(raw)}catch{return json({error:"invalid_json"},400)}
  const existing=await env.DB.prepare("SELECT upload_method,source,thumbnail_url,import_parts FROM scripts WHERE id=? AND user_id=? LIMIT 1").bind(id,user.id).first();if(!existing)return json({error:"script_not_found_or_forbidden"},404);
  const title=String(body.title||"").trim().slice(0,80),description=String(body.description||"").trim().slice(0,500),category=String(body.category||"Other").trim().slice(0,40),uploadMethod=String(body.upload_method??existing.upload_method??"source"),source=String(body.source??existing.source??"");
  let importParts=body.import_parts;
  if(importParts===undefined){try{importParts=JSON.parse(existing.import_parts||"[]")}catch{importParts=[]}}
  if(!Array.isArray(importParts))return json({error:"invalid_import_parts"},400);
  if(!["source","import","both"].includes(uploadMethod))return json({error:"invalid_upload_method"},400);
  if(importParts.length>20||importParts.some(x=>typeof x!=="string"||!x.trim()||x.length>25000)||importParts.reduce((n,x)=>n+x.length,0)>200000)return json({error:"invalid_import_parts",message:"Import requires 1-20 non-empty parts, up to 25,000 characters each and 200,000 characters total."},400);
  if(title.length<2)return json({error:"invalid_title",message:"Title must contain 2 to 80 characters."},400);
  if(source.length>100000||(["source","both"].includes(uploadMethod)&&!source.trim()))return json({error:"invalid_source",message:"Source is required for Source and Both methods, up to 100000 characters."},400);
  if(uploadMethod==="import"||uploadMethod==="both"){if(!importParts.length)return json({error:"invalid_import_parts",message:"Add at least one String Import Part."},400)}else importParts=[];
  let thumbnail=existing.thumbnail_url||"";
  if(Object.prototype.hasOwnProperty.call(body,"thumbnail_url")&&body.thumbnail_url!==null)thumbnail=String(body.thumbnail_url||"").trim();
  if(thumbnail&&thumbnail.length>250000)return json({error:"invalid_thumbnail"},400);
  if(thumbnail&&!(/^https:\/\//i.test(thumbnail)&&thumbnail.length<=1000)&&!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(thumbnail))return json({error:"invalid_thumbnail"},400);
  try{const result=await env.DB.prepare("UPDATE scripts SET title=?,description=?,category=?,source=?,thumbnail_url=?,upload_method=?,import_parts=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?").bind(title,description,category,source,thumbnail||null,uploadMethod,JSON.stringify(importParts),id,user.id).run();if(!result.meta?.changes)return json({error:"script_not_found_or_forbidden"},404);return json({ok:true,id,upload_method:uploadMethod,import_parts:importParts})}catch{return json({error:"database_error"},500)}
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