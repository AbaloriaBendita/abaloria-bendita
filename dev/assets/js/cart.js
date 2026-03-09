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
