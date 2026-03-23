document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     PREPAGO CLICK
  ========================= */
  document.addEventListener("click", (e) => {

    const btn = e.target.closest(".js-prepago");
    if (!btn) return;

    e.preventDefault();

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
  });

});


/* =========================
   RENDER SUMMARY
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

  document.querySelector(".prepago-subtotal")?.textContent = totales.subtotal.toFixed(2) + " €";
  document.querySelector(".prepago-iva")?.textContent = totales.iva.toFixed(2) + " €";
  document.querySelector(".prepago-shipping")?.textContent =
    totales.shipping === 0 ? "Gratis" : totales.shipping.toFixed(2) + " €";
  document.querySelector(".prepago-total")?.textContent = totales.total.toFixed(2) + " €";
}


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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart })
    });

    const data = await res.json();

    if (!res.ok || !data.payment_url) {
      throw new Error("No payment_url");
    }

    window.location.href = data.payment_url;

  } catch (err) {

    console.error(err);
    alert("No hemos podido iniciar el pago.");

    btn.disabled = false;
    btn.innerText = "Continuar compra";
  }

});
