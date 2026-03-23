document.addEventListener("DOMContentLoaded", async () => {

  const GRID = document.getElementById("collection-grid");
  if (!GRID) return;

  const slug = window.location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  const BASE = `${window.location.origin}/assets/colecciones/${slug}/`;

  const piezas = await fetch(`${BASE}index.json`).then(r => r.json());
  piezas.reverse();

  let index = 0;

  for (const id of piezas) {

    const isFirst = index === 0;

    try {

      const res = await fetch(`${BASE}${id}/data.json`);
      if (!res.ok) continue;

      const data = await res.json();

      const estado = (data.estado || "").toLowerCase();

      let estadoClass = "sold";
      let statusText = "Vendida";

      if (estado === "disponible") {
        estadoClass = "available";
        statusText = "Disponible";
      }

      if (estado === "variaciones") {
        estadoClass = "variation";
        statusText = "Disponible con variaciones";
      }

      const mainImg = `${BASE}${id}/main.jpg`;
      const hoverImg = `${BASE}${id}/hover.jpg`;

      let hasHover = false;

      try {
        const imgTest = new Image();
        imgTest.src = hoverImg;
        await new Promise((res, rej) => {
          imgTest.onload = res;
          imgTest.onerror = rej;
        });
        hasHover = true;
      } catch {}

      const card = document.createElement("article");
      card.className = `piece-card ${estadoClass}`;

      const imageHTML = hasHover
        ? `
        <div class="piece-image has-swipe">
          <span class="status-badge ${estadoClass}">${statusText}</span>
          <span class="price-badge">${data.precio}€</span>

          <img src="${mainImg}" alt="${data.titulo}"
            ${isFirst ? 'fetchpriority="high"' : 'loading="lazy"'}>

          <img src="${hoverImg}" class="hover-img" aria-hidden="true">
        </div>`
        : `
        <div class="piece-image">
          <span class="status-badge ${estadoClass}">${statusText}</span>
          <span class="price-badge">${data.precio}€</span>

          <img src="${mainImg}" alt="${data.titulo}" loading="lazy">
        </div>`;

      let cta = "";

      if (estado === "disponible") {

        const variacionesCTA = data.permite_variaciones
          ? `
          <a href="#" class="piece-cta-secondary js-open-modal"
             data-img="${mainImg}">
            ¿Lo quieres con variaciones?
          </a>`
          : "";

        cta = `
        <div class="piece-ctas">

          <button class="piece-cta js-prepago"
            data-id="${data.id}"
            data-title="${data.titulo}"
            data-price="${data.precio}"
            data-img="${mainImg}">
            Comprar ahora
          </button>

          <button class="piece-cta-outline js-add-cart"
            data-id="${data.id}"
            data-title="${data.titulo}"
            data-price="${data.precio}"
            data-img="${mainImg}">
            Añadir carrito
          </button>

        </div>

        ${variacionesCTA}`;
      }

      if (estado === "variaciones" || estado === "vendida") {
        cta = `
        <a href="#" class="piece-cta alt js-open-modal"
           data-img="${mainImg}">
          Encargar parecida
        </a>`;
      }

      card.innerHTML = `
        ${imageHTML}
        <div class="piece-body">
          <h2>${data.titulo}</h2>
          ${data.nota_disponibilidad ? `<p>${data.nota_disponibilidad}</p>` : ""}
          ${cta}
        </div>
      `;

      GRID.appendChild(card);
      index++;

    } catch (err) {
      console.error(err);
    }
  }

});
