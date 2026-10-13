/* Catálogo de prototipo: solo lectura y sin llamadas de pago */
/* Re-map shared navigation inside preview without touching live partials. */
function adaptPreviewNavigation(){
 const en=document.documentElement.lang==="en";
 const header=document.querySelector(".site-header");
 if(!header)return false;
 header.querySelectorAll('a[href="/#colecciones"],a[href="/en/#collections"]').forEach(a=>a.href="#redesign-catalog");
 header.querySelectorAll('a[href="/"]').forEach(a=>a.href="/prototipo/");
 header.querySelectorAll('a[href="/en/"]').forEach(a=>a.href="/prototipo/en/");
 return true;
}
if(!adaptPreviewNavigation()){
 const observer=new MutationObserver(()=>{if(adaptPreviewNavigation())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
}

/* Seguridad: bloquear acciones ANTES de cargar datos externos o inicializar otros scripts. */
document.addEventListener("click",e=>{
 if(e.target.closest(".js-prepago,.js-add-cart,.cart-checkout,.js-open-modal,#go-to-payment")){
   e.preventDefault();e.stopImmediatePropagation();
   alert(document.documentElement.lang==="en"?"Preview only — purchasing is disabled.":"Solo vista previa: compras y encargos de ficha desactivados.");
 }
},true);
document.addEventListener("submit",e=>{
 e.preventDefault();e.stopImmediatePropagation();
 alert(document.documentElement.lang==="en"?"Forms are disabled in this preview.":"Los formularios están desactivados en este prototipo.");
},true);
document.addEventListener("DOMContentLoaded",async()=>{
const EN=document.documentElement.lang==="en";
const names=EN?["All","55 €","79 €","99 €","Special","Earrings","Brooches","Rings"]:["Todas","55 €","79 €","99 €","Especiales","Pendientes","Broches","Anillos"];
const groups=["all","55","79","99","especiales","pendientes","broches","anillos"];
const bases=["55","79","99","especiales","pendientes-broches-anillos"];
const featured=["79-60","79-59","99-01","55-34"]; // Revisión editorial pendiente
const grid=document.getElementById("redesign-grid"),filter=document.getElementById("redesign-filters"),sort=document.getElementById("redesign-sort"),more=document.getElementById("redesign-more"),count=document.getElementById("redesign-count");
if(!grid)return;
let active="all",limit=12,items=[];
groups.forEach((g,i)=>{const b=document.createElement("button");b.type="button";b.textContent=names[i];b.setAttribute("aria-pressed",String(i===0));b.addEventListener("click",()=>{active=g;limit=12;filter.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));render()});filter.append(b)});
const load=async slug=>{
 try{const base="/assets/colecciones/"+slug+"/";const ids=await fetch(base+"index.json").then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
 const results=await Promise.all(ids.map(async(id,i)=>{try{
 const url=EN?"/en/assets/"+slug+"/"+id+"/data.json":base+id+"/data.json";
 const res=await fetch(url);if(!res.ok)return null;const d=await res.json();
 return {...d,slug,id,seq:i,main:base+id+"/main.jpg",hover:base+id+"/hover.jpg",kind:slug==="pendientes-broches-anillos"?(id.startsWith("pendientes")?"pendientes":id.startsWith("broches")?"broches":id.startsWith("anillos")?"anillos":"other"):slug};
 }catch{return null}}));return results.filter(Boolean);
 }catch(e){console.warn("Collection load failed",slug,e);return []}
};
const result=await Promise.all(bases.map(load));items=result.flat();
function card(d){
 const status=(d.estado||"").toLowerCase();
 const available=status==="disponible",variation=status==="variaciones",state=available?"available":variation?"variation":"sold";
 const title=String(d.titulo||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const note=String(d.nota_disponibilidad||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const card=document.createElement("article");card.className="piece-card "+state;
 const img=document.createElement("div");img.className="piece-image";
 img.innerHTML='<span class="status-badge '+state+'">'+(available?(EN?"Available":"Disponible"):variation?(EN?"Variations":"Variaciones"):(EN?"Sold":"Vendida"))+'</span><span class="price-badge">'+Number(d.precio||0)+'€</span>';
 const pic=document.createElement("img");pic.src=d.main;pic.alt=d.titulo||"";pic.loading="lazy";pic.decoding="async";img.append(pic);
 const hover=document.createElement("img");hover.src=d.hover;hover.alt="";hover.className="hover-img";hover.loading="lazy";hover.setAttribute("aria-hidden","true");hover.addEventListener("error",()=>{hover.remove();img.classList.remove("has-swipe")});img.classList.add("has-swipe");img.append(hover);
 const body=document.createElement("div");body.className="piece-body";
 body.innerHTML='<h2>'+title+'</h2>'+(note?'<p class="piece-note">'+note+'</p>':'');
 if(available){const buttons=document.createElement("div");buttons.className="piece-ctas";buttons.innerHTML='<button type="button" class="piece-cta js-prepago">'+(EN?"Buy now":"Comprar ahora")+'</button><button type="button" class="piece-cta-outline js-add-cart">'+(EN?"Add to cart":"Añadir carrito")+'</button>';body.append(buttons)}
 else {const b=document.createElement("button");b.type="button";b.className="piece-cta alt js-open-modal";b.textContent=variation?(EN?"Request variation":"Encargar variación"):(EN?"Request similar":"Encargar parecida");body.append(b)}
 const legal=document.createElement("ul");legal.className="piece-legal";legal.innerHTML="<li>"+(EN?"Free shipping from €150.":"Envío gratis desde 150 €.")+"</li><li>"+(EN?"VAT included.":"IVA incluido.")+"</li>";body.append(legal);
 card.append(img,body);return card;
}
function render(){
 let a=items.filter(d=>active==="all"||(groups.includes(d.kind)&&d.kind===active)||(d.slug===active));
 const mode=sort.value;
 a.sort((x,y)=>{if(mode==="low"||mode==="high")return (Number(x.precio)-Number(y.precio))*(mode==="low"?1:-1);if(mode==="recommended"){const sold=v=>v.estado==="vendida"?1:0;const statusDiff=sold(x)-sold(y);if(statusDiff)return statusDiff;const fx=featured.indexOf(x.id),fy=featured.indexOf(y.id);if(fx>=0||fy>=0)return (fx<0?999:fx)-(fy<0?999:fy)}
 const sold=v=>v.estado==="vendida"?1:0;return sold(x)-sold(y)||y.seq-x.seq});
 count.textContent=a.length+(EN?" pieces":" piezas");
 grid.replaceChildren(...a.slice(0,limit).map(card));more.hidden=a.length<=limit;
}
sort.addEventListener("change",()=>{limit=12;render()});more.addEventListener("click",()=>{limit+=12;render()});render();

});
