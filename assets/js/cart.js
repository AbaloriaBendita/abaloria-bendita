/* =========================
   INIT SAFE (ANTI DUPLICADOS)
========================= */

if (window.__cartInitialized) {
  console.log("🛒 Cart ya inicializado");
} else {
  window.__cartInitialized = true;


/* =========================
   CONFIG
========================= */

const CART_KEY = "abaloria_cart";


/* =========================
   STORAGE
========================= */

function getCart(){
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}


/* =========================
   CÁLCULO
========================= */

function calcularTotales(cart, shippingZone = "peninsula"){

  let subtotal = 0;

  cart.forEach(p => {
    const qty = Number(p.qty) || 1;
    subtotal += Number(p.precio) * qty;
  });

  const iva = subtotal * 0.21 / 1.21;
  const base = subtotal - iva;
  const shipping = window.getShippingAmount(subtotal, shippingZone);
  const total = shipping === null ? null : subtotal + shipping;

  return { base, iva, subtotal, shipping, total };
}

window.calcularTotales = calcularTotales;


/* =========================
   COUNT HEADER
========================= */

function updateCartCount(){

  const cart = getCart();

  const total = cart.reduce((sum,p)=> sum + (p.qty || 1),0);

  const el = document.querySelector(".cart-count");

  if(el) el.textContent = total;

}


/* =========================
   ADD
========================= */

function addToCart(item){

  const cart = getCart();

  const existing = cart.find(p => p.id === item.id);

  if(existing){
    existing.qty += 1;
  } else {
    item.qty = 1;
    cart.push(item);
  }

  saveCart(cart);

  console.log("🛒 CART:", cart);

}


/* =========================
   REMOVE
========================= */

function removeFromCart(id){
  const cart = getCart().filter(p => p.id !== id);
  saveCart(cart);
}


/* =========================
   RENDER
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
${TEXTS.cart.remove}
</button>
        </div>

        <div class="cart-price">
          ${p.qty} × ${p.precio} €
        </div>
      </div>
    `;

    container.appendChild(el);

  });

  if(ivaEl) ivaEl.textContent = totales.iva.toFixed(2) + " €";

  if(shippingEl){
    shippingEl.textContent =
      totales.shipping === 0
        ? TEXTS.cart.shippingFree
        : `${TEXTS.cart.shippingFrom} ${totales.shipping.toFixed(2)} €`;
  }

  if(totalEl){
    totalEl.textContent =
      totales.shipping === 0
        ? totales.total.toFixed(2) + " €"
        : `${TEXTS.cart.shippingFrom} ${totales.total.toFixed(2)} €`;
  }

}


/* =========================
   OPEN CART
========================= */

function openCart(){

  const panel = document.getElementById("cartPanel");
  if(!panel) return;

  renderCart();
  updateCartCount();

  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

}

function closeCart(){

  const panel = document.getElementById("cartPanel");
  if(!panel) return;

  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";

}


/* =========================
   EVENTS
========================= */

function initCart() {
  updateCartCount();
  renderCart();
}

document.addEventListener("DOMContentLoaded", initCart);


document.addEventListener("click",(e)=>{

  /* ADD */
  const addBtn = e.target.closest(".js-add-cart");

  if(addBtn){
    const item = {
      id: addBtn.dataset.id,
      titulo: addBtn.dataset.title,
      precio: Number(addBtn.dataset.price),
      img: addBtn.dataset.img
    };

    addToCart(item);
    openCart();
    return;
  }

  /* OPEN CART ICON */
  const openBtn = e.target.closest(".js-open-cart");
  if(openBtn){
    e.preventDefault();
    openCart();
    return;
  }

  /* CLOSE */
  const closeBtn =
    e.target.closest(".cart-close") ||
    e.target.closest(".cart-backdrop") ||
    e.target.closest(".cart-overlay");

  if(closeBtn){
    closeCart();
    return;
  }

  /* QUANTITY */
  const plus = e.target.closest(".cart-plus");
  const minus = e.target.closest(".cart-minus");
  const remove = e.target.closest(".cart-remove");

  if(plus || minus || remove){

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
    return;
  }

  /* CHECKOUT */
  const checkoutBtn = e.target.closest(".cart-checkout");

  if(checkoutBtn){

    const cart = getCart();

    if(!cart.length){
      alert(TEXTS.cart.empty);
      return;
    }

    localStorage.setItem("checkout_mode", "cart");
    localStorage.removeItem("checkout_single");

    closeCart();

    const modal = document.getElementById("modal-prepago");
    const rgpdCheck = document.getElementById("rgpd-check");
    const peninsulaRadio = document.querySelector(
      'input[name="shipping_zone"][value="peninsula"]'
    );

    if (!modal) {
      alert(TEXTS.cart.checkoutError);
      return;
    }

    if (rgpdCheck) rgpdCheck.checked = false;
    if (peninsulaRadio) peninsulaRadio.checked = true;

    if (typeof renderPrepagoGallery === "function") {
      renderPrepagoGallery(cart);
    }

    if (typeof renderPrepagoSummary === "function") {
      renderPrepagoSummary();
    }

    openModal(modal);
    return;
  }

});

}
