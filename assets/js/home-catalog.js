/* Real homepage catalog with existing checkout handlers */
/* Re-map shared navigation inside preview without touching live partials. */
function adaptPreviewNavigation(){
 const en=document.documentElement.lang==="en";
 const header=document.querySelector(".site-header");
 if(!header)return false;
 const syncHeight=()=>document.body.style.setProperty("--preview-header-height",Math.ceil(header.getBoundingClientRect().height)+"px");
 syncHeight();
 if(!header.dataset.previewHeightBound){header.dataset.previewHeightBound="1";window.addEventListener("resize",syncHeight,{passive:true});if(typeof ResizeObserver!=="undefined")new ResizeObserver(syncHeight).observe(header)}
 header.querySelectorAll('a[href="/#colecciones"],a[href="/en/#collections"]').forEach(a=>a.href="#redesign-catalog");
 header.querySelectorAll('a[href="/"]').forEach(a=>a.href="/");
 header.querySelectorAll('a[href="/en/"]').forEach(a=>a.href="/en/");
 return true;
}
if(!adaptPreviewNavigation()){
 const observer=new MutationObserver(()=>{if(adaptPreviewNavigation())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
}

document.addEventListener("DOMContentLoaded",async()=>{
const EN=document.documentElement.lang==="en";
const names=EN?["All","55 €","79 €","99 €","Special","Earrings","Brooches","Rings"]:["Todas","55 €","79 €","99 €","Especiales","Pendientes","Broches","Anillos"];
const groups=["all","55","79","99","especiales","pendientes","broches","anillos"];
const bases=["55","79","99","especiales","pendientes-broches-anillos"];
const featured=[]; // Prioridades editoriales pendientes de validar sobre fotografías reales
const mobileQuery=window.matchMedia("(max-width: 639px)");
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

/* Vista ampliada móvil, solo para el prototipo. No invoca Square ni formularios. */
let selected=null, photoIndex=0, previousFocus=null;
const detail=document.createElement("div");
detail.className="redesign-detail";
detail.id="redesign-detail";
detail.setAttribute("aria-hidden","true");
detail.innerHTML=`<div class="redesign-detail-backdrop"></div>
<section class="redesign-detail-panel" role="dialog" aria-modal="true" aria-labelledby="redesign-detail-title" tabindex="-1">
<button class="redesign-detail-close" type="button" aria-label="${EN?"Close":"Cerrar"}">×</button>
<div class="redesign-detail-gallery"><img id="redesign-detail-image" alt=""><button type="button" class="redesign-detail-prev" aria-label="${EN?"Previous image":"Imagen anterior"}">‹</button><button type="button" class="redesign-detail-next" aria-label="${EN?"Next image":"Imagen siguiente"}">›</button></div><div class="redesign-detail-indicators" aria-label="${EN?"Images":"Imágenes"}"><button type="button" class="is-current" aria-label="${EN?"Image 1":"Imagen 1"}" aria-current="true"></button><button type="button" aria-label="${EN?"Image 2":"Imagen 2"}"></button></div>
<div class="redesign-detail-content"><span id="redesign-detail-state"></span><h2 id="redesign-detail-title"></h2><strong id="redesign-detail-price"></strong><p id="redesign-detail-note"></p><div id="redesign-detail-actions" class="redesign-detail-actions"></div><p class="redesign-detail-legal">${EN?"VAT included · Free shipping from €150.":"IVA incluido · Envío gratis a partir de 150 €."}</p></div>
</section>`;
document.body.append(detail);
const detailImg=detail.querySelector("#redesign-detail-image");
const detailPrev=detail.querySelector(".redesign-detail-prev");
const detailNext=detail.querySelector(".redesign-detail-next");
const gallery=detail.querySelector(".redesign-detail-gallery");
const indicators=Array.from(detail.querySelectorAll(".redesign-detail-indicators button"));
function setDetailImage(){
 if(!selected)return;
 detailImg.src=photoIndex===0?selected.main:selected.hover;
 detailPrev.hidden=detailNext.hidden=!selected.hoverAvailable;
 indicators.forEach((dot,i)=>{dot.hidden=i===1&&!selected.hoverAvailable;dot.classList.toggle("is-current",i===photoIndex);dot.setAttribute("aria-current",String(i===photoIndex));});
 detailImg.alt=(selected.titulo||"")+" · "+(photoIndex+1);
}
function closeDetail(){
 detail.classList.remove("is-open");
 detail.setAttribute("aria-hidden","true");
 document.body.classList.remove("redesign-detail-open");
 selected=null;
 previousFocus?.focus?.();
}
function openDetail(d){
 if(!mobileQuery.matches)return;
 previousFocus=document.activeElement;
 selected=d;photoIndex=0;
 detail.querySelector("#redesign-detail-title").textContent=d.titulo||"";
 detail.querySelector("#redesign-detail-price").textContent=Number(d.precio||0)+" €";
 detail.querySelector("#redesign-detail-note").textContent=d.nota_disponibilidad||"";
 const status=(d.estado||"").toLowerCase();
 detail.querySelector("#redesign-detail-state").textContent=status==="disponible"?(EN?"Available":"Disponible"):status==="variaciones"?(EN?"Variations":"Variaciones"):(EN?"Sold":"Vendida");
 const actions=detail.querySelector("#redesign-detail-actions");actions.replaceChildren();
 const labels=status==="disponible"?(EN?["Buy now","Add to cart"]:["Comprar ahora","Añadir al carrito"]):[status==="variaciones"?(EN?"Request variation":"Encargar variación"):(EN?"Request similar":"Encargar parecida")];
 labels.forEach((label,i)=>{
   const b=document.createElement("button");b.type="button";b.textContent=label;
   b.className=i===0?"redesign-detail-buy":"redesign-detail-cart";
   if(status==="disponible"){
 b.classList.add(i===0?"js-prepago":"js-add-cart");
 b.dataset.id=d.id;b.dataset.title=d.titulo;b.dataset.price=d.precio;b.dataset.img=d.main;
}else{b.classList.add("js-open-modal");b.dataset.img=d.main}
b.addEventListener("click",()=>closeDetail());
   actions.append(b);
 });
 d.hoverAvailable=true;
 setDetailImage();
 detail.classList.add("is-open");
 detail.setAttribute("aria-hidden","false");
 document.body.classList.add("redesign-detail-open");
 detail.querySelector(".redesign-detail-close").focus();
}
detailImg.addEventListener("error",()=>{
 if(selected&&photoIndex===1){selected.hoverAvailable=false;photoIndex=0;setDetailImage();}
});
detail.querySelector(".redesign-detail-close").addEventListener("click",closeDetail);
detail.querySelector(".redesign-detail-backdrop").addEventListener("click",closeDetail);
detailPrev.addEventListener("click",()=>{photoIndex=photoIndex===0?1:0;setDetailImage()});
detailNext.addEventListener("click",()=>{photoIndex=photoIndex===0?1:0;setDetailImage()});
indicators.forEach((dot,i)=>dot.addEventListener("click",()=>{if(selected?.hoverAvailable){photoIndex=i;setDetailImage()}}));
let startX=0,startY=0,swiping=false;
gallery.addEventListener("touchstart",e=>{if(!selected?.hoverAvailable||e.touches.length!==1)return;startX=e.touches[0].clientX;startY=e.touches[0].clientY;swiping=true;},{passive:true});
gallery.addEventListener("touchend",e=>{if(!swiping||!selected?.hoverAvailable)return;swiping=false;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){photoIndex=dx<0?1:0;setDetailImage()}},{passive:true});
gallery.addEventListener("touchcancel",()=>{swiping=false},{passive:true});
document.addEventListener("keydown",e=>{
 if(!detail.classList.contains("is-open"))return;
 if(e.key==="Escape"){closeDetail();return;}
 if((e.key==="ArrowRight"||e.key==="ArrowLeft")&&selected?.hoverAvailable){photoIndex=e.key==="ArrowRight"?1:0;setDetailImage();}
 if(e.key==="Tab"){
  const focusable=Array.from(detail.querySelectorAll("button:not([hidden])"));
  if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();focusable.at(-1).focus();}
  else if(!e.shiftKey&&document.activeElement===focusable.at(-1)){e.preventDefault();focusable[0].focus();}
 }
});
mobileQuery.addEventListener?.("change",e=>{if(!e.matches)closeDetail()});

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
 pic.addEventListener("error",()=>{if(!pic.dataset.fallback){pic.dataset.fallback="1";pic.src=d.hover;}else{card.remove();console.warn("Missing product images:",d.id)}});
 const body=document.createElement("div");body.className="piece-body";
 body.innerHTML='<h2>'+title+'</h2>'+(note?'<p class="piece-note">'+note+'</p>':'');
 if(available){const buttons=document.createElement("div");buttons.className="piece-ctas";buttons.innerHTML='<button type="button" class="piece-cta js-prepago">'+(EN?"Buy now":"Comprar ahora")+'</button><button type="button" class="piece-cta-outline js-add-cart">'+(EN?"Add to cart":"Añadir carrito")+'</button>';
for(const b of buttons.querySelectorAll("button")){b.dataset.id=d.id;b.dataset.title=d.titulo;b.dataset.price=d.precio;b.dataset.img=d.main;}
body.append(buttons);
if(d.permite_variaciones){const v=document.createElement("a");v.href="#";v.className="piece-cta-secondary js-open-modal";v.dataset.img=d.main;v.textContent=EN?"Want it with variations?":"¿Lo quieres con variaciones?";body.append(v)}}
 else {const b=document.createElement("button");b.type="button";b.className="piece-cta alt js-open-modal";b.dataset.img=d.main;b.textContent=variation?(EN?"Request variation":"Encargar variación"):(EN?"Request similar":"Encargar parecida");body.append(b)}
 const legal=document.createElement("ul");legal.className="piece-legal";legal.innerHTML="<li>"+(EN?"Free shipping from €150.":"Envío gratis desde 150 €.")+"</li><li>"+(EN?"VAT included.":"IVA incluido.")+"</li>";body.append(legal);
 const view=document.createElement("button");
 view.type="button";view.className="redesign-mobile-view";
 view.textContent=EN?"View piece":"Ver pieza";
 view.addEventListener("click",()=>openDetail(d));
 img.addEventListener("click",()=>{if(mobileQuery.matches)openDetail(d)});
 card.append(img,body,view);return card;
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

/* Deep link to a specific catalog piece, e.g. /en/?piece=55-25.
   No price override or checkout changes. */
const requestedId=new URLSearchParams(window.location.search).get("piece");
if(requestedId){
 const match=items.find(d=>d.id===requestedId);
 if(match){
   active=match.slug==="pendientes-broches-anillos"?match.kind:match.slug;
   filter.querySelectorAll("button").forEach((b,i)=>b.setAttribute("aria-pressed",String(groups[i]===active)));
   sort.value="low";limit=items.length;
   render();
   const displayed=Array.from(grid.querySelectorAll(".piece-card"));
   const within=items.filter(d=>active==="all"||(groups.includes(d.kind)&&d.kind===active)||(d.slug===active)).sort((a,b)=>Number(a.precio)-Number(b.precio));
   const index=within.findIndex(d=>d.id===requestedId);
   const target=displayed[index];
   if(target){
     target.style.outline="3px solid #6FA8D6";
     target.style.outlineOffset="3px";
     requestAnimationFrame(()=>setTimeout(()=>{
       target.scrollIntoView({behavior:"smooth",block:"center"});
       if(mobileQuery.matches)openDetail(match);
     },300));
   }
 }
}

});
