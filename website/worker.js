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
async function readSession(req,secret){try{const [p,s]=getCookie(req,COOKIE).split(".");if(!p||!s||!secret)return null;const expected=await sign(p,secret);if(s!==expected)return null;const v=JSON.parse(new TextDecoder().decode(unb64u(p)));return v.exp>Date.now()/1000?v:null}catch{return null}}
async function githubFile(path){if(!path||path.length>500||path.split("/").some(p=>!p||p==="."||p===".."))return null;const r=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/"+path.split("/").map(encodeURIComponent).join("/"),{headers:{"user-agent":"Sieu-Sv_Library"}});return r.ok?await r.text():null}
async function currentUser(req,env){const session=await readSession(req,env.gg_secret);if(!session)return null;return await env.DB.prepare("SELECT id,username,display_name,avatar_url,bio,created_at FROM users WHERE google_sub=? LIMIT 1").bind(session.sub).first()}
export default {async fetch(request,env){
 const url=new URL(request.url),origin=url.origin;
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":origin,"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type","vary":"Origin"}});
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
  const old=await env.DB.prepare("SELECT id,username FROM users WHERE google_sub=? LIMIT 1").bind(profile.sub).first();
  let username=old?.username;
  if(!username){const base=(profile.email.split("@")[0]||"user").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,20)||"user";username=base+"_"+crypto.randomUUID().slice(0,6)}
  const id=old?.id||profile.sub;
  await env.DB.prepare("INSERT INTO users (id,google_sub,username,display_name,avatar_url) VALUES (?,?,?,?,?) ON CONFLICT(google_sub) DO UPDATE SET display_name=excluded.display_name,avatar_url=excluded.avatar_url").bind(id,profile.sub,username,profile.name||username,profile.picture||"").run();
  const session=await makeSession(profile.sub,env.gg_secret);
  const headers=new Headers({Location:origin+"/?login=success","Cache-Control":"no-store"});headers.append("Set-Cookie",cookie(COOKIE,session,604800));headers.append("Set-Cookie",cookie(STATE_COOKIE,"",0));return new Response(null,{status:302,headers});
 }
 if(url.pathname==="/auth/logout"&&request.method==="POST")return json({ok:true},200,{"Set-Cookie":cookie(COOKIE,"",0)});
 if(url.pathname==="/api/me"&&request.method==="GET"){const user=await currentUser(request,env);return json({user})}
 if(url.pathname==="/api/health"){let database=false;try{await env.DB.prepare("SELECT 1").first();database=true}catch{}return json({ok:true,service:"Sieu-Sv_Library API",database})}
 if(url.pathname==="/api/github/scripts"){const r=await fetch("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1",{headers:{"accept":"application/vnd.github+json","user-agent":"Sieu-Sv_Library"}});if(!r.ok)return json({error:"github_unavailable"},502);const data=await r.json();const scripts=(data.tree||[]).filter(x=>x.type==="blob"&&x.path.toLowerCase().endsWith(".lua")).map(x=>({path:x.path,name:x.path.split("/").pop().replace(/\\.lua$/i,""),title:x.path.split("/").pop().replace(/\\.lua$/i,""),author:"minhReal",username:"minhReal",category:"GitHub",url:"https://raw.githubusercontent.com/"+REPO+"/main/"+x.path.split("/").map(encodeURIComponent).join("/"),description:"Lua script from the Sieu-Sv_Library repository"}));return json({scripts,syncedAt:new Date().toISOString()})}
 if(url.pathname==="/api/github/script"&&request.method==="GET"){const path=url.searchParams.get("path")||"";if(!path.toLowerCase().endsWith(".lua"))return json({error:"invalid_script_path"},400);const source=await githubFile(path);if(source===null)return json({error:"script_not_found"},404);const title=path.split("/").pop().replace(/\\.lua$/i,"");return json({title,name:title,source,path,description:"Lua script from the Sieu-Sv_Library repository",category:"GitHub",author:"minhReal",username:"minhReal",kind:"GitHub"})}
 if(url.pathname.startsWith("/api/scripts/")&&request.method==="GET"){const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));if(!id||id.length>128)return json({error:"invalid_id"},400);try{const row=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.visibility='public' LIMIT 1").bind(id).first();if(!row)return json({error:"script_not_found"},404);return json({...row,owner:row.display_name||row.username||"community",kind:"Community"})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="GET"){try{const q=(url.searchParams.get("q")||"").slice(0,100);const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.created_at,s.updated_at,u.username FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind("%"+q+"%","%"+q+"%").all();return json({scripts:rows.results||[]})}catch{return json({error:"database_error"},500)}}
 if(url.pathname==="/api/scripts"&&request.method==="POST")return json({error:"publishing_not_ready",message:"Sign-in is enabled, but the publish workflow is not implemented yet."},501);
 if(url.pathname==="/script"||url.pathname.startsWith("/script/")){const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/script.html");if(!page.ok)return new Response("Script page source not found",{status:502});return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}})}
 if(url.pathname==="/"){const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/index.html");if(!page.ok)return new Response("Website source not found",{status:502});return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}})}
 return json({error:"not_found"},404)
}};