const CART_KEY = "abaloria_cart";

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(item){

  const cart = getCart();

  cart.push(item);

  saveCart(cart);

  updateCartCount();
}

function removeFromCart(id){

  const cart = getCart().filter(p => p.id !== id);

  saveCart(cart);

  updateCartCount();
}

function cartTotal(){

  const cart = getCart();

  return cart.reduce((t,p)=> t + p.precio,0);
}

function updateCartCount(){

  const el = document.querySelector(".cart-count");

  if(el) el.textContent = getCart().length;
}

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

 alert("Añadido al carrito");

});

document.addEventListener("DOMContentLoaded",updateCartCount);

const CART_KEY = "abaloria_cart";

function getCart(){
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

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

function updateCartCount(){

  const cart = getCart();

  const total = cart.reduce((sum,p)=>sum+p.qty,0);

  const el = document.querySelector(".cart-count");

  if(el) el.textContent = total;

}

document.addEventListener("DOMContentLoaded",updateCartCount);
