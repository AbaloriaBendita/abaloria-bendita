/* =========================
   LANGUAGE + TEXTS (GLOBAL)
========================= */

const isEN = window.location.pathname.startsWith("/en");

/* =========================
   SHIPPING CONFIG
========================= */

window.SHIPPING_CONFIG = {
  freeFrom: 120,
  rates: {
    peninsula: 8.5,
    baleares: 11.5,
    canarias: 14.5
  }
};

window.getShippingAmount = function(subtotal, shippingZone = "peninsula") {
  if (shippingZone === "quote") return null;

  if (subtotal >= window.SHIPPING_CONFIG.freeFrom) {
    return 0;
  }

  return window.SHIPPING_CONFIG.rates[shippingZone] ?? null;
};

window.TEXTS = {
  catalog: {
    status: {
      available: isEN ? "Available" : "Disponible",
      variations: isEN ? "Available with variations" : "Disponible con variaciones",
      sold: isEN ? "Sold" : "Vendida"
    },

    cta: {
      buy: isEN ? "Buy now" : "Comprar ahora",
      addCart: isEN ? "Add to cart" : "Añadir carrito",
      variations: isEN ? "Want it with variations?" : "¿Lo quieres con variaciones?",
      variationsAlt: isEN ? "I want this necklace with variations" : "Quiero este collar con variaciones",
      sold: isEN ? "Request a similar one" : "Encargar parecida"
    },

    legal: {
      shipping: isEN
        ? "Free shipping on orders from €120."
        : "Envío gratis a partir de 120 €.",
      iva: isEN ? "VAT included." : "IVA incluido."
    }
  },

  cart: {
    remove: isEN ? "remove" : "eliminar",
    empty: isEN ? "Your cart is empty" : "Tu carrito está vacío",
    shippingFree: isEN ? "Free" : "Gratis",
    shippingFrom: isEN ? "From" : "Desde",
    checkoutError: isEN
      ? "We couldn’t start the payment."
      : "No hemos podido iniciar el pago."
  },

  checkout: {
    empty: isEN ? "No products in cart" : "No hay productos",
    redirecting: isEN ? "Redirecting..." : "Redirigiendo...",
    shippingQuote: isEN ? "Contact us" : "Consultar",
    shippingQuoteMessage: isEN
      ? "For Ceuta, Melilla and destinations outside Spain, please contact us before placing the order."
      : "Para Ceuta, Melilla y envíos fuera de España, consúltanos antes de realizar el pedido.",
    error: isEN
      ? "We couldn’t start the payment."
      : "No hemos podido iniciar el pago."
  }
};

/* =========================
   SHIPPING COPY SYNC
   Corrige textos legacy de la home mientras
   el umbral global está centralizado en 120 €.
========================= */

function syncLegacyShippingCopy() {
  document.querySelectorAll(".form-intro").forEach(el => {
    el.innerHTML = el.innerHTML
      .replace("a partir de 150€", "a partir de 120€")
      .replace("over €150", "from €120");
  });
}

/* =========================
   MODAL HELPERS
========================= */

function openModal(modal){
  if(!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(modal){
  if(!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}


/* =========================
   MODAL ENCARGO · MODOS
========================= */

function configureEncargoModal(mode = "reference", options = {}) {
  const modal = document.getElementById("modal-encargo");
  if (!modal) return null;

  const modalImg = document.getElementById("modal-img-preview");
  const modalInput = document.getElementById("modal-img-input");
  const copy = modal.querySelector(".modal-copy");
  const form = modal.querySelector("form");
  const typeInput = form?.querySelector('input[name="tipo"]');
  const comments = form?.querySelector('textarea[name="comentarios"]');
  const submit = form?.querySelector('button[type="submit"]');

  if (mode === "shipping") {
    const cart = Array.isArray(options.cart) ? options.cart : [];
    const firstProduct = cart.find(item => item?.img) || cart[0] || {};
    const refs = cart
      .map(item => {
        const title = String(item?.titulo || "Producto");
        const ref = item?.id ? `Ref: ${item.id}` : "";
        const qty = Number(item?.qty) || 1;
        return `${title}${ref ? ` (${ref})` : ""} x${qty}`;
      })
      .join(" | ");

    if (copy) {
      copy.innerHTML = isEN
        ? "<strong>Check shipping for your order.</strong><br>Tell us the destination and we’ll confirm the shipping cost before you buy."
        : "<strong>Consulta el envío de tu pedido.</strong><br>Dinos dónde debemos enviarlo y te confirmaremos el coste antes de comprar.";
    }

    if (typeInput) {
      typeInput.value = isEN
        ? `Shipping enquiry${refs ? ` · ${refs}` : ""}`
        : `Consulta de envío${refs ? ` · ${refs}` : ""}`;
    }

    if (comments) {
      comments.placeholder = isEN
        ? "Country, city or any shipping detail we should know…"
        : "País, ciudad o cualquier detalle del envío que debamos tener en cuenta…";
    }

    if (submit) {
      submit.textContent = isEN ? "Ask about shipping" : "Consultar envío";
    }

    if (modalImg) {
      modalImg.src = firstProduct.img || "";
      modalImg.alt = firstProduct.titulo || "";
    }

    if (modalInput) {
      modalInput.value = firstProduct.img || "";
    }

    return modal;
  }

  if (copy) {
    copy.innerHTML = isEN
      ? "<strong>Request a piece inspired by this one.</strong><br>Share your details and we’ll design it especially for you."
      : "<strong>Encarga tu Abaloria parecida a esta.</strong><br>Danos tus datos y la diseñaremos especialmente para ti.";
  }

  if (typeInput) {
    typeInput.value = isEN
      ? "Reference / similar piece"
      : "Referencia / pieza similar";
  }

  if (comments) {
    comments.placeholder = isEN
      ? "Special request, style, colours…"
      : "Petición especial, estilo, colores…";
  }

  if (submit) {
    submit.textContent = isEN
      ? "Request a similar Abaloria"
      : "Encargar una Abaloria parecida";
  }

  if (modalImg) {
    modalImg.src = options.img || "";
    modalImg.alt = "";
  }

  if (modalInput) {
    modalInput.value = options.img || "";
  }

  return modal;
}

window.openShippingInquiryModal = function(cart) {
  const prepagoModal = document.getElementById("modal-prepago");
  if (prepagoModal) closeModal(prepagoModal);

  const modal = configureEncargoModal("shipping", { cart });
  if (modal) openModal(modal);
};


/* =========================
   MODAL ENCARGO
========================= */

document.addEventListener("click", e => {

  const btn = e.target.closest(".js-open-modal");
  if (!btn) return;

  e.preventDefault();

  const modal = configureEncargoModal("reference", {
    img: btn.dataset.img
  });

  if (modal) openModal(modal);

});


/* =========================
   CLOSE MODALS (GLOBAL)
========================= */

document.addEventListener("click", e => {

  const closeBtn = e.target.closest(".modal-close");
  const backdrop = e.target.classList.contains("modal-backdrop");

  if (!closeBtn && !backdrop) return;

  const modal = e.target.closest(".modal");
  if (modal) closeModal(modal);

});


/* =========================
   ESC CLOSE GLOBAL
========================= */

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modal = document.querySelector(".modal.is-open");
  if (modal) closeModal(modal);
});


/* =========================
   LOAD PARTIALS
========================= */

async function loadPartial(selector, url, callback) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const html = await res.text();
    el.innerHTML = html;

    if (typeof callback === "function") {
      callback(el);
    }

  } catch (err) {
    console.error("Error loading partial:", url, err);
  }
}


/* =========================
   INIT HEADER (NAV MOBILE)
========================= */

function initHeader() {

  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      mobileMenu.classList.remove("is-open");
    }
  });

}


/* =========================
   FIX SAFARI HEADER RENDER
========================= */

function forceHeaderRender() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  requestAnimationFrame(() => {
    header.style.transform = "translateZ(0)";
    header.style.webkitTransform = "translateZ(0)";
  });
}


/* =========================
   INIT GLOBAL
========================= */

document.addEventListener("DOMContentLoaded", () => {

  // SHIPPING COPY LEGACY
  syncLegacyShippingCopy();

  // HEADER
  loadPartial("#header-placeholder", isEN ? "/partials/header-en.html" : "/partials/header.html", () => {
    initHeader();
    forceHeaderRender();

    if (typeof initCart === "function") {
      initCart();
    }
  });

  // FOOTER
  loadPartial("#footer-placeholder", isEN ? "/partials/footer-en.html" : "/partials/footer.html");

  // CART
  loadPartial("#cart-placeholder", isEN ? "/partials/cart-en.html" : "/partials/cart.html");

  // MODAL ENCARGO
  loadPartial("#modal-encargo-placeholder", isEN ? "/partials/modal-encargo-en.html" : "/partials/modal-encargo.html");

  // MODAL PREPAGO
  loadPartial("#modal-prepago-placeholder", isEN ? "/partials/modal-prepago-en.html" : "/partials/modal-prepago.html");

});
