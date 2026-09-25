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

/* =========================
   LIMPIEZA VISUAL DE PRECIOS
   - Algunos assets nuevos proceden de creatividades Canva/PDF
     con el precio incrustado en la propia foto.
   - El precio real de la ficha sigue viniendo de data.json.
   - Solo se limpia la imagen mostrada; no afecta a carrito,
     checkout ni a la URL original del producto.
========================= */

const PRICE_CLEANUP = {
  "55-24": { x: .67, y: .79, w: .33, h: .21 },
  "55-26": { x: .66, y: .79, w: .34, h: .21 },
  "55-27": { x: .74, y: .80, w: .26, h: .20 },
  "55-28": { x: .31, y: .88, w: .33, h: .12 },
  "55-29": { x: .71, y: .81, w: .29, h: .19 },
  "55-30": { x: .69, y: .80, w: .31, h: .20 },
  "55-31": { x: .67, y: .79, w: .33, h: .21 },
  "55-32": { x: .64, y: .80, w: .36, h: .20 },
  "55-33": { x: .68, y: .79, w: .32, h: .21 },
  "55-34": { x: .75, y: .90, w: .25, h: .10 },
  "79-54": { x: .68, y: .80, w: .32, h: .20 },
  "79-55": { x: .70, y: .81, w: .30, h: .19 },
  "79-56": { x: .68, y: .81, w: .32, h: .19 },
  "79-59": { x: .75, y: .90, w: .25, h: .10 },
  "99-24": { x: .73, y: .77, w: .27, h: .23 },
  "anillos-04": { x: .75, y: .92, w: .25, h: .08 }
};

const cleanupObjectUrls = [];

async function getDisplayImage(src, cleanup) {
  if (!cleanup) return src;

  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Fondo azul original de las creatividades de Abaloria.
        ctx.fillStyle = "#71a9dc";
        ctx.fillRect(
          Math.round(cleanup.x * canvas.width),
          Math.round(cleanup.y * canvas.height),
          Math.round(cleanup.w * canvas.width),
          Math.round(cleanup.h * canvas.height)
        );

        canvas.toBlob(blob => {
          if (!blob) {
            resolve(src);
            return;
          }

          const objectUrl = URL.createObjectURL(blob);
          cleanupObjectUrls.push(objectUrl);
          resolve(objectUrl);
        }, "image/jpeg", 0.88);

      } catch (err) {
        console.warn("No se pudo limpiar el precio de", src, err);
        resolve(src);
      }
    };

    img.onerror = () => resolve(src);
    img.src = src;
  });
}

window.addEventListener("beforeunload", () => {
  cleanupObjectUrls.forEach(url => URL.revokeObjectURL(url));
});
  
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

      // Imagen que ve el usuario: limpia el precio incrustado cuando procede.
      // mainImg se conserva como URL pública para carrito, checkout y formularios.
      const displayMainImg = await getDisplayImage(mainImg, PRICE_CLEANUP[id]);

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

     <img src="${displayMainImg}"
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

      <img src="${displayMainImg}"
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
data-id="${data.id}"
data-title="${data.titulo}"
  data-price="${data.precio}"
  data-img="${mainImg}"
>
${TEXTS.catalog.cta.buy}
</button>

<button
 class="piece-cta-outline js-add-cart"
data-id="${data.id}"
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
