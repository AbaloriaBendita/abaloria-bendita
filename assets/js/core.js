/* =========================
   NAV MOBILE
========================= */

document.addEventListener("DOMContentLoaded", () => {

  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (!toggle || !mobileMenu) return;

  /* abrir / cerrar */
  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  /* cerrar al clicar link */
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      mobileMenu.classList.remove("is-open");
    }
  });

});

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

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modal-encargo");
  const modalImg = document.getElementById("modal-img-preview");
  const modalInput = document.getElementById("modal-img-input");

  document.addEventListener("click", e => {
    const btn = e.target.closest(".js-open-modal");
    if (!btn) return;

    e.preventDefault();

    modalImg.src = btn.dataset.img;
    modalInput.value = btn.dataset.img;

    openModal(modal);
  });

  modal?.addEventListener("click", e => {
    if (
      e.target.classList.contains("modal-backdrop") ||
      e.target.classList.contains("modal-close")
    ) {
      closeModal(modal);
    }
  });

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

    // 🔥 ejecutar lógica después de inyectar HTML
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

  /* abrir / cerrar menú */
  toggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("is-open");
  });

  /* cerrar al clicar link */
  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      mobileMenu.classList.remove("is-open");
    }
  });

}


/* =========================
   INIT GLOBAL
========================= */

document.addEventListener("DOMContentLoaded", () => {

  loadPartial("#header-placeholder", "/partials/header.html", () => {
    initHeader(); // 🔥 solo cuando el header ya existe
  });

  loadPartial("#footer-placeholder", "/partials/footer.html");

});
