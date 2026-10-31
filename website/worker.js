const REPO="minhReal/SieuSV-Storage";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
async function githubFile(path){
 if(!path||path.length>500||path.split("/").some(p=>!p||p==="."||p==="..")) return null;
 const url="https://raw.githubusercontent.com/"+REPO+"/main/"+path.split("/").map(encodeURIComponent).join("/");
 const r=await fetch(url,{headers:{"user-agent":"Sieu-Sv_Library"}});
 if(!r.ok)return null;
 return await r.text();
}
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization"}});
  if(url.pathname==="/api/health") {
   let database=false; try { await env.DB.prepare("SELECT 1").first(); database=true; } catch {}
   return json({ok:true,service:"Sieu-Sv_Library API",database});
  }
  if(url.pathname==="/api/github/scripts") {
   const r=await fetch("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1",{headers:{"accept":"application/vnd.github+json","user-agent":"Sieu-Sv_Library"}});
   if(!r.ok) return json({error:"github_unavailable"},502);
   const data=await r.json();
   const scripts=(data.tree||[]).filter(x=>x.type==="blob"&&x.path.toLowerCase().endsWith(".lua")).map(x=>({path:x.path,name:x.path.split("/").pop().replace(/\.lua$/i,""),title:x.path.split("/").pop().replace(/\.lua$/i,""),author:"minhReal",username:"minhReal",category:"GitHub",url:"https://raw.githubusercontent.com/"+REPO+"/main/"+x.path.split("/").map(encodeURIComponent).join("/"),description:"Lua script from the Sieu-Sv_Library repository"}));
   return json({scripts,syncedAt:new Date().toISOString()});
  }
  if(url.pathname==="/api/github/script"&&request.method==="GET") {
   const path=url.searchParams.get("path")||"";
   if(!path.toLowerCase().endsWith(".lua"))return json({error:"invalid_script_path"},400);
   const source=await githubFile(path);
   if(source===null)return json({error:"script_not_found"},404);
   const title=path.split("/").pop().replace(/\.lua$/i,"");
   return json({title,name:title,source,path,description:"Lua script from the Sieu-Sv_Library repository",category:"GitHub",author:"minhReal",username:"minhReal",kind:"GitHub"});
  }
  if(url.pathname.startsWith("/api/scripts/")&&request.method==="GET") {
   const id=decodeURIComponent(url.pathname.slice("/api/scripts/".length));
   if(!id||id.length>128)return json({error:"invalid_id"},400);
   try {
    const row=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.created_at,s.updated_at,u.username,u.display_name,u.avatar_url FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.visibility='public' LIMIT 1").bind(id).first();
    if(!row)return json({error:"script_not_found"},404);
    return json({...row,owner:row.display_name||row.username||"community",kind:"Community"});
   } catch { return json({error:"database_error"},500); }
  }
  if(url.pathname==="/api/scripts"&&request.method==="GET") {
   try {
    const q=(url.searchParams.get("q")||"").slice(0,100);
    const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.created_at,s.updated_at,u.username FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind("%"+q+"%","%"+q+"%").all();
    return json({scripts:rows.results||[]});
   } catch { return json({error:"database_error"},500); }
  }
  if(url.pathname==="/api/scripts"&&request.method==="POST") return json({error:"authentication_not_configured",message:"Google OAuth must be configured before publishing."},503);
  if(url.pathname==="/script"||url.pathname.startsWith("/script/")) {
   const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/script.html");
   if(!page.ok)return new Response("Script page source not found",{status:502});
   return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}});
  }
  if(url.pathname==="/") {
   const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/index.html");
   if(!page.ok) return new Response("Website source not found",{status:502});
   return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}});
  }
  return json({error:"not_found"},404);
 }
};