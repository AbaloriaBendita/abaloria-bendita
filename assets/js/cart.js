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
   TOTAL
========================= */

function cartTotal(){

  const cart = getCart();

  return cart.reduce((t,p)=> t + p.precio * p.qty,0);
}

/* =========================
   UPDATE HEADER COUNT
========================= */

function updateCartCount(){

  const cart = getCart();

  const total = cart.reduce((sum,p)=>sum + p.qty,0);

  const el = document.querySelector(".cart-count");

  if(el) el.textContent = total;
}

/* =========================
   ADD TO CART CLICK
========================= */

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

 console.log("Producto añadido:",item);

 alert("Añadido al carrito");

});

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded",updateCartCount);

function renderCart(){

 const container = document.querySelector(".cart-items");
 const totalEl = document.querySelector(".cart-total");
   
 function shippingCost(){

 const total = cartTotal();

 if(total >= 150) return 0;

 return 8.5;

}

 if(!container) return;

 const cart = getCart();

 container.innerHTML = "";

 let total = 0;

 cart.forEach(p=>{

   total += p.precio * p.qty;

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

 const shipping = shippingCost();

const finalTotal = total + shipping;

const shippingEl = document.querySelector(".cart-shipping");

if(shippingEl){
 shippingEl.textContent =
 shipping === 0 ? "Gratis" : shipping.toFixed(2) + " €";
}

totalEl.textContent = finalTotal + " €";
}

/* =========================
   OPEN / CLOSE CART PANEL
========================= */

document.addEventListener("click",(e)=>{

  const openBtn = e.target.closest(".js-open-cart");

  if(openBtn){
    e.preventDefault();

    renderCart();

    const panel = document.getElementById("cartPanel");

    if(panel){
panel.classList.add("is-open");
panel.setAttribute("aria-hidden","false");    }
  }

  const closeBtn =
    e.target.closest(".cart-close") ||
    e.target.closest(".cart-backdrop");

  if(closeBtn){
    const panel = document.getElementById("cartPanel");

    if(panel){
panel.classList.remove("is-open");
       document.activeElement.blur();
panel.setAttribute("aria-hidden","true");    }
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

/* FIX qty undefined */

 if(!item.qty) item.qty = 1;

 if(plus){
   item.qty += 1;
 }

 if(minus){
   item.qty -= 1;
 }

 if(remove || item.qty <= 0){
   cart = cart.filter(p => p.id !== id);
 }

 saveCart(cart);
 renderCart();

});

function shippingCost(){

 const total = cartTotal();

 if(total >= 150) return 0;

 return 8,5;
}

document.querySelector(".cart-checkout")?.addEventListener("click", () => {

 const cart = getCart();

 if(cart.length === 0){
   alert("Tu carrito está vacío");
   return;
 }

 document.getElementById("cart-data").value = JSON.stringify(cart);

 openModal(document.getElementById("modal-prepago"));

});
