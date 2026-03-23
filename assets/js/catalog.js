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

      // (tu HTML intacto)
      // 👉 aquí no toco lógica para no romper nada

      GRID.appendChild(card);
      index++;

    } catch (err) {
      console.error(err);
    }

  }

});
