document.addEventListener("DOMContentLoaded", async () => {

  console.log("✅ Catálogo cargado");

  const GRID = document.getElementById("collection-grid");
  if (!GRID) {
    console.error("❌ No existe #collection-grid");
    return;
  }

  /* =========================
     1. DETECTAR COLECCIÓN
  ========================= */

  const slug = window.location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

const BASE = `${window.location.origin}/assets/colecciones/${slug}/`;
  
  console.log("📁 Colección:", slug);
  console.log("📦 Base:", BASE);

  /* =========================
     3. LOOP SECUENCIAL
  ========================= */

const piezas = await fetch(`${BASE}index.json`).then(r => r.json());
  piezas.reverse();

let index = 0;

for (const id of piezas) {  
  const isFirst = index === 0;

    try {

const dataUrl = isEN
  ? `${window.location.origin}/en/assets/${slug}/${id}/data.json`
  : `${BASE}${id}/data.json`;
      const res = await fetch(dataUrl);

      if (!res.ok) continue;

      const data = await res.json();

      /* =========================
         ESTADO NORMALIZADO
      ========================= */

      const estado = (data.estado || "").toLowerCase();

      let estadoClass = "sold";
let statusText = TEXTS.catalog.status.sold;
      
      if (estado === "disponible") {
        estadoClass = "available";
statusText = TEXTS.catalog.status.available;
      }

      if (estado === "variaciones") {
        estadoClass = "variation";
statusText = TEXTS.catalog.status.variations;
      }

      const card = document.createElement("article");
      card.className = `piece-card ${estadoClass}`;

      /* =========================
         IMÁGENES
      ========================= */

      const mainImg = `${BASE}${id}/main.jpg`;
      const hoverImg = `${BASE}${id}/hover.jpg`;

      let hasHover = false;

try {
  const imgTest = new Image();
  imgTest.src = hoverImg;
  await new Promise((resolve, reject) => {
    imgTest.onload = resolve;
    imgTest.onerror = reject;
  });
  hasHover = true;
} catch {
  hasHover = false;
}

      const imageHTML = hasHover
  ? `
    <div class="piece-image has-swipe">
      <span class="status-badge ${estadoClass}">${statusText}</span>
      <span class="price-badge">${data.precio}€</span>

     <img src="${mainImg}"
     alt="${data.titulo}"
     width="945"
     height="1181"
     ${isFirst 
       ? 'fetchpriority="high"'
       : 'loading="lazy" decoding="async"'
     }>

      <img src="${hoverImg}"
           alt=""
           class="hover-img"
           aria-hidden="true"
           width="945"
           height="1181"
           loading="lazy"
           decoding="async">
    </div>
  `
  : `
    <div class="piece-image">
      <span class="status-badge ${estadoClass}">${statusText}</span>
      <span class="price-badge">${data.precio}€</span>

      <img src="${mainImg}"
           alt="${data.titulo}"
           width="945"
           height="1181"
           loading="lazy"
           decoding="async">
    </div>
  `;
      /* =========================
         CTA SEGÚN ESTADO
      ========================= */

      let cta = "";

      if (estado === "disponible") {

  const variacionesCTA = data.permite_variaciones
    ? `
      <a href="#"
         class="piece-cta-secondary js-open-modal"
         data-img="${mainImg}">
${TEXTS.catalog.cta.variations}
</a>
    `
    : "";

 cta = `
<div class="piece-ctas">

<button
  class="piece-cta js-prepago"
data-id="${data.coleccion}-${data.id}"
  data-title="${data.titulo}"
  data-price="${data.precio}"
  data-img="${mainImg}"
>
${TEXTS.catalog.cta.buy}
</button>

<button
 class="piece-cta-outline js-add-cart"
data-id="${data.coleccion}-${data.id}"
data-title="${data.titulo}"
 data-price="${data.precio}"
 data-img="${mainImg}">

<svg class="cart-mini" viewBox="0 0 24 24" fill="none" stroke="currentColor">
<path stroke-width="2" d="M6 6h15l-1.5 9h-13z"/>
<circle cx="9" cy="20" r="1"/>
<circle cx="18" cy="20" r="1"/>
</svg>

${TEXTS.catalog.cta.addCart}
</button>

</div>

${variacionesCTA}
`;
}

      if (estado === "variaciones") {
        cta = `
          <a href="#"
             class="piece-cta alt js-open-modal"
             data-img="${mainImg}">
${TEXTS.catalog.cta.variationsAlt}
</a>
        `;
      }

      if (estado === "vendida") {
        cta = `
          <a href="#"
             class="piece-cta alt js-open-modal"
             data-img="${mainImg}">
${TEXTS.catalog.cta.sold}
</a>
        `;
      }

      /* =========================
         CARD FINAL
      ========================= */

      card.innerHTML = `
        ${imageHTML}

        <div class="piece-body">
          <h2>${data.titulo}</h2>

          ${
            data.nota_disponibilidad
              ? `<p class="piece-note">${data.nota_disponibilidad}</p>`
              : ""
          }

          ${cta}

          <ul class="piece-legal">
            <li>${TEXTS.catalog.legal.shipping}</li>
<li>${TEXTS.catalog.legal.iva}</li>
          </ul>
        </div>
      `;

      GRID.appendChild(card);
      index++;

    } catch (err) {
      console.error("❌ Error en pieza:", id, err);
    }
  }

});
