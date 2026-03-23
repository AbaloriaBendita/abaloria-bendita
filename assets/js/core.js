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

  loadPartial("#header-placeholder", "/partials/header.html", () => {
    initHeader();
    forceHeaderRender();
  });

  loadPartial("#footer-placeholder", "/partials/footer.html");

  // 🔥 NUEVO
  loadPartial("#cart-placeholder", "/partials/cart.html");
   loadPartial("#modal-encargo-placeholder", "/partials/modal-encargo.html");
loadPartial("#modal-prepago-placeholder", "/partials/modal-prepago.html");

});
