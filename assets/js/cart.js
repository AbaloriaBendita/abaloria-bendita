const CART_KEY = "abaloria_cart";

/* =========================
   STORAGE
========================= */

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* =========================
   CÁLCULO CENTRAL
========================= */

function calcularTotales(cart){

  let subtotal = 0;

  cart.forEach(p => {
    const qty = p.qty || 1;
    subtotal += Number(p.precio) * qty;
  });

  const iva = subtotal * 0.21 / 1.21;
  const base = subtotal - iva;
  const shipping = subtotal >= 150 ? 0 : 8.5;
  const total = subtotal + shipping;

  return {
    base,
    iva,
    subtotal,
    shipping,
    total
  };
}

/* =========================
   UPDATE HEADER COUNT
========================= */

function updateCartCount(){

  const cart = getCart();

  const total = cart.reduce((sum,p)=> sum + (p.qty || 1),0);

  const el = document.querySelector(".cart-count");

  if(el) el.textContent = total;

}

/* =========================
   ADD PRODUCT
========================= */

function addToCart(item){

  const cart = getCart();

  const existing = cart.find(p => p.id === item.id);

  if(existing){
    existing.qty += 1;
  }else{
    item.qty = 1;
    cart.push(item);
  }

  saveCart(cart);
}

/* =========================
   REMOVE PRODUCT
========================= */

function removeFromCart(id){
  const cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
}

/* =========================
   RENDER CART
========================= */

function renderCart(){

  const container = document.querySelector(".cart-items");
  const totalEl = document.querySelector(".cart-total");
  const shippingEl = document.querySelector(".cart-shipping");
  const ivaEl = document.querySelector(".cart-iva");

  if(!container) return;

  const cart = getCart();

  container.innerHTML = "";

  const totales = calcularTotales(cart);

  cart.forEach(p=>{

    if(!p.qty) p.qty = 1;

    const el = document.createElement("div");
    el.className = "cart-item";

    el.innerHTML = `
      <img src="${p.img}" alt="">
      <div class="cart-item-info">
        <strong>${p.titulo}</strong>

        <div class="cart-qty">
          <button class="cart-minus" data-id="${p.id}">−</button>
          <span>${p.qty}</span>
          <button class="cart-plus" data-id="${p.id}">+</button>
          <button class="cart-remove" data-id="${p.id}">
            eliminar
          </button>
        </div>

        <div class="cart-price">
          ${p.qty} × ${p.precio} €
        </div>
      </div>
    `;

    container.appendChild(el);

  });

  /* Totales */

  if(ivaEl){
    ivaEl.textContent = totales.iva.toFixed(2) + " €";
  }

  if(shippingEl){
    shippingEl.textContent =
      totales.shipping === 0 ? "Gratis" : totales.shipping.toFixed(2) + " €";
  }

  if(totalEl){
    totalEl.textContent = totales.total.toFixed(2) + " €";
  }

}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
});

document.addEventListener("click",(e)=>{

  const btn = e.target.closest(".js-add-cart");

  if(!btn) return;

  const item = {
    id: btn.dataset.id,
    titulo: btn.dataset.title,
    precio: Number(btn.dataset.price),
    img: btn.dataset.img
  };

  addToCart(item);
  renderCart();

  /* 🔥 ABRIR CARRITO (como antes) */

  const panel = document.getElementById("cartPanel");

  if(panel){
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
  }

});
/* =========================
   CART QUANTITY
========================= */

document.addEventListener("click",(e)=>{

  const plus = e.target.closest(".cart-plus");
  const minus = e.target.closest(".cart-minus");
  const remove = e.target.closest(".cart-remove");

  if(!plus && !minus && !remove) return;

  const id = (plus || minus || remove).dataset.id;

  let cart = getCart();

  const item = cart.find(p => p.id === id);

  if(!item) return;

  if(!item.qty) item.qty = 1;

  if(plus) item.qty += 1;
  if(minus) item.qty -= 1;

  if(remove || item.qty <= 0){
    cart = cart.filter(p => p.id !== id);
  }

  saveCart(cart);
  renderCart();

});

/* =========================
   CHECKOUT CARRITO
========================= */

document.addEventListener("click",(e)=>{

  const btn = e.target.closest(".cart-checkout");
  if(!btn) return;

  const cart = getCart();

  if(!cart.length){
    alert("Tu carrito está vacío");
    return;
  }

  /* cerrar carrito */

  const panel = document.getElementById("cartPanel");
  if(panel){
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden","true");
  }

 /* checkout directo */

(async () => {

  try {

    const fd = new FormData();
    fd.set("cart", JSON.stringify(cart));

    const res = await fetch("https://pago-square.hola-38b.workers.dev", {
  method: "POST",
  body: fd
});

console.log("📡 STATUS WORKER:", res.status);

const text = await res.text();

console.log("📡 RAW RESPONSE WORKER:", text);

let data;

try {
  data = JSON.parse(text);
} catch {
  throw new Error("Respuesta no es JSON");
}

console.log("💰 CHECKOUT CART:", data);

if (!res.ok || !data.payment_url) {
  throw new Error(data.error || "Error en pago");
}

window.location.href = data.payment_url;

  } catch (err) {

    console.error("❌ ERROR CHECKOUT CART:", err);

    alert("No hemos podido iniciar el pago. Inténtalo de nuevo.");

  }

})();
   });  

/* =========================
   OPEN / CLOSE CART PANEL
========================= */

document.addEventListener("click", (e) => {

  const panel = document.getElementById("cartPanel");
  if (!panel) return;

  /* 🔓 ABRIR DESDE ICONO HEADER */
  const openBtn = e.target.closest("#cart-open");

  if (openBtn) {
    e.preventDefault();

    renderCart();

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  /* 🔒 CERRAR */
  const closeBtn =
    e.target.closest(".cart-close") ||
    e.target.closest(".cart-backdrop");

  if (closeBtn) {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

});
