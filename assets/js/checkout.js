window.initPrepagoCTA = function() {

  const btn = document.getElementById("go-to-payment");
  const checkbox = document.getElementById("rgpd-check");

  if (!btn || !checkbox) return;

  if (btn.__bound) return;
  btn.__bound = true;

  btn.disabled = !checkbox.checked;

  checkbox.addEventListener("change", () => {
    btn.disabled = !checkbox.checked;
  });

  btn.addEventListener("click", async () => {

    if (btn.disabled) return;

    const cart = getCheckoutCart();

    if (!cart.length) {
      alert("No hay productos");
      return;
    }

    btn.innerText = "Redirigiendo...";
    btn.disabled = true;

    try {

      const res = await fetch("https://pago-square.hola-38b.workers.dev", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ cart })
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok || !data.payment_url) {
        throw new Error();
      }

      window.location.href = data.payment_url;

    } catch {

      alert("No hemos podido iniciar el pago.");
      btn.disabled = false;
      btn.innerText = "Continuar compra";
    }

  });

};


/* =========================
   HELPERS
========================= */

function getCheckoutCart() {
  const mode = localStorage.getItem("checkout_mode");

  if (mode === "single") {
    return JSON.parse(localStorage.getItem("checkout_single") || "[]");
  }

  return JSON.parse(localStorage.getItem("abaloria_cart") || "[]");
}


/* =========================
   PREPAGO SUMMARY
========================= */

function renderPrepagoSummary(){

  const cart = getCheckoutCart();
  if (!cart.length) return;

  const totales = calcularTotales(cart);

  const subtotalEl = document.querySelector(".prepago-subtotal");
  const ivaEl = document.querySelector(".prepago-iva");
  const shippingEl = document.querySelector(".prepago-shipping");
  const totalEl = document.querySelector(".prepago-total");

  if (subtotalEl) subtotalEl.textContent = totales.subtotal.toFixed(2) + " €";
  if (ivaEl) ivaEl.textContent = totales.iva.toFixed(2) + " €";
  if (shippingEl) {
    shippingEl.textContent =
      totales.shipping === 0 ? "Gratis" : totales.shipping.toFixed(2) + " €";
  }
  if (totalEl) totalEl.textContent = totales.total.toFixed(2) + " €";
}


/* =========================
   EVENTOS GLOBAL CHECKOUT
========================= */

document.addEventListener("click", async (e) => {

/* =========================
   PREPAGO (abrir modal)
========================= */

const prepagoBtn = e.target.closest(".js-prepago");

if (prepagoBtn) {

  const producto = {
    id: prepagoBtn.dataset.id,
    titulo: prepagoBtn.dataset.title,
    precio: Number(prepagoBtn.dataset.price),
    img: prepagoBtn.dataset.img,
    qty: 1
  };

  localStorage.setItem("checkout_mode", "single");
  localStorage.setItem("checkout_single", JSON.stringify([producto]));

  const modal = document.getElementById("modal-prepago");
  const preview = document.getElementById("prepago-img-preview");

  if (!modal) return;

  if (preview) {
    preview.src = producto.img;
    preview.alt = producto.titulo;
  }

  renderPrepagoSummary();
  openModal(modal);

  // 🔥 binding limpio
  window.initPrepagoCTA && window.initPrepagoCTA();

  return;
}
   
  /* =========================
     CERRAR MODALES
  ========================= */

  const closeBtn = e.target.closest(".modal-close");
  const backdrop = e.target.classList.contains("modal-backdrop");

  if (closeBtn || backdrop) {
    const modal = e.target.closest(".modal");
    if (modal) closeModal(modal);
  }

});



