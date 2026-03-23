/* =========================
   PREPAGO SUMMARY
========================= */

function renderPrepagoSummary(){

  const mode = localStorage.getItem("checkout_mode");

  let cart = [];

  if (mode === "single") {
    cart = JSON.parse(localStorage.getItem("checkout_single") || "[]");
  } else {
    cart = JSON.parse(localStorage.getItem("abaloria_cart") || "[]");
  }

  if (!cart.length) return;

  const totales = calcularTotales(cart);

  document.querySelector(".prepago-subtotal").textContent = totales.subtotal.toFixed(2) + " €";
  document.querySelector(".prepago-iva").textContent = totales.iva.toFixed(2) + " €";
  document.querySelector(".prepago-shipping").textContent =
    totales.shipping === 0 ? "Gratis" : totales.shipping.toFixed(2) + " €";
  document.querySelector(".prepago-total").textContent = totales.total.toFixed(2) + " €";
}


/* =========================
   PREPAGO CLICK
========================= */

document.addEventListener("click", (e) => {

  const btn = e.target.closest(".js-prepago");

  if (btn) {

    const producto = {
      id: btn.dataset.id,
      titulo: btn.dataset.title,
      precio: Number(btn.dataset.price),
      img: btn.dataset.img,
      qty: 1
    };

    localStorage.setItem("checkout_mode", "single");
    localStorage.setItem("checkout_single", JSON.stringify([producto]));

    const preview = document.getElementById("prepago-img-preview");
    if (preview) {
      preview.src = producto.img;
      preview.alt = producto.titulo;
    }

    renderPrepagoSummary();

    openModal(document.getElementById("modal-prepago"));
  }

});


/* =========================
   RGPD CHECK
========================= */

document.addEventListener("change", (e) => {

  if (e.target.id === "rgpd-check") {

    const btn = document.getElementById("go-to-payment");
    if (!btn) return;

    btn.disabled = !e.target.checked;
  }

});


/* =========================
   CTA PAGO
========================= */

document.addEventListener("click", async (e) => {

  const btn = document.getElementById("go-to-payment");
  if (!btn || !btn.contains(e.target)) return;

  const mode = localStorage.getItem("checkout_mode");

  let cart = [];

  if (mode === "single") {
    cart = JSON.parse(localStorage.getItem("checkout_single") || "[]");
  } else {
    cart = JSON.parse(localStorage.getItem("abaloria_cart") || "[]");
  }

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

   /* =========================
   CERRAR MODALES
========================= */

document.addEventListener("click", (e) => {

  const closeBtn = e.target.closest(".modal-close");
  const backdrop = e.target.classList.contains("modal-backdrop");

  if (!closeBtn && !backdrop) return;

  const modal = e.target.closest(".modal");

  if (modal) {
    closeModal(modal);
  }

});

});
