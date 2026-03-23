const CART_KEY = "abaloria_cart";

/* =========================
   STORAGE
========================= */

function getCart(){
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
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

  /* ADD TO CART */
  const addBtn = e.target.closest(".js-add-cart");
  if(addBtn){
    const item = {
      id: addBtn.dataset.id,
      titulo: addBtn.dataset.title,
      precio: Number(addBtn.dataset.price),
      img: addBtn.dataset.img
    };

    addToCart(item);
    renderCart();

    const panel = document.getElementById("cartPanel");
    if(panel && typeof openModal === "function"){
      openModal(panel);
      document.body.style.overflow = "hidden";
    }

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
      alert("Tu carrito está vacío");
      return;
    }

    const panel = document.getElementById("cartPanel");
    if(panel && typeof closeModal === "function"){
      closeModal(panel);
    }

    (async () => {
      try {

        const res = await fetch("https://pago-square.hola-38b.workers.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart })
        });

        const data = await res.json();

        if (!res.ok || !data.payment_url) {
          throw new Error("Error en pago");
        }

        window.location.href = data.payment_url;

      } catch (err) {
        console.error(err);
        alert("No hemos podido iniciar el pago.");
      }
    })();

  }
   });  
