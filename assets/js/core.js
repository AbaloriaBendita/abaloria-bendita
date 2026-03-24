/* =========================
   LANGUAGE + TEXTS (GLOBAL)
========================= */

const isEN = window.location.pathname.startsWith("/en");

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
        ? "Free shipping on orders over €150."
        : "Envío gratis a partir de 150 €.",
      iva: isEN ? "VAT included." : "IVA incluido."
    }
  }
};


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
   MODAL ENCARGO
========================= */

document.addEventListener("click", e => {

  const btn = e.target.closest(".js-open-modal");
  if (!btn) return;

  e.preventDefault();

  const modal = document.getElementById("modal-encargo");
  const modalImg = document.getElementById("modal-img-preview");
  const modalInput = document.getElementById("modal-img-input");

  if (modalImg) modalImg.src = btn.dataset.img;
  if (modalInput) modalInput.value = btn.dataset.img;

  openModal(modal);

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
