const REPO="minhReal/SieuSV-Storage";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export default {
 async fetch(request,env) {
  const url=new URL(request.url);
  if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization"}});
  if(url.pathname==="/api/health") {
   let database=false; try { await env.DB.prepare("SELECT 1").first(); database=true; } catch {}
   return json({ok:true,service:"SieuSV Storage API",database});
  }
  if(url.pathname==="/api/github/scripts") {
   const r=await fetch("https://api.github.com/repos/"+REPO+"/git/trees/main?recursive=1",{headers:{"accept":"application/vnd.github+json","user-agent":"SieuSV-Storage"}});
   if(!r.ok) return json({error:"github_unavailable"},502);
   const data=await r.json();
   const scripts=(data.tree||[]).filter(x=>x.type==="blob"&&x.path.toLowerCase().endsWith(".lua")).map(x=>({path:x.path,name:x.path.split("/").pop().replace(/\.lua$/i,""),title:x.path.split("/").pop().replace(/\.lua$/i,""),author:"minhReal",username:"minhReal",category:"GitHub",url:"https://raw.githubusercontent.com/"+REPO+"/main/"+x.path.split("/").map(encodeURIComponent).join("/"),description:"Lua script from the SieuSV-Storage repository"}));
   return json({scripts,syncedAt:new Date().toISOString()});
  }
  if(url.pathname==="/api/scripts"&&request.method==="GET") {
   try {
    const q=(url.searchParams.get("q")||"").slice(0,100);
    const rows=await env.DB.prepare("SELECT s.id,s.title,s.description,s.category,s.user_id,s.source,s.created_at,s.updated_at,u.username FROM scripts s LEFT JOIN users u ON u.id=s.user_id WHERE s.visibility='public' AND (s.title LIKE ? OR s.description LIKE ?) ORDER BY s.created_at DESC LIMIT 100").bind("%"+q+"%","%"+q+"%").all();
    return json({scripts:rows.results||[]});
   } catch { return json({error:"database_error"},500); }
  }
  if(url.pathname==="/api/scripts"&&request.method==="POST") return json({error:"authentication_not_configured",message:"Google OAuth must be configured before publishing."},503);
  if(url.pathname==="/") {
   const page=await fetch("https://raw.githubusercontent.com/"+REPO+"/main/website/index.html");
   if(!page.ok) return new Response("Website source not found",{status:502});
   return new Response(await page.text(),{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-cache"}});
  }
  return json({error:"not_found"},404);
 }
};