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
