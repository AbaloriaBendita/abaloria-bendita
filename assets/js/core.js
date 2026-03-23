document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     CART PANEL (ORIGINAL)
  ========================= */

  const cartButton = document.getElementById("cart-open");
  const cartPanel = document.getElementById("cartPanel");
  const cartClose = document.querySelector(".cart-close");
  const cartBackdrop = document.querySelector(".cart-backdrop");

  if (cartButton && cartPanel) {

    cartButton.addEventListener("click", (e) => {
      e.preventDefault();
      cartPanel.classList.add("is-open");
      cartPanel.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });

    const closeCart = () => {
      cartPanel.classList.remove("is-open");
      cartPanel.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    if (cartClose) cartClose.addEventListener("click", closeCart);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCart);
  }


  /* =========================
     NAV MOBILE (ORIGINAL)
  ========================= */

  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }


  /* =========================
     MODAL ENCARGO (ORIGINAL)
  ========================= */

  const modal = document.getElementById("modal-encargo");
  const modalImg = document.getElementById("modal-img-preview");
  const modalInput = document.getElementById("modal-img-input");

  document.addEventListener("click", e => {
    const btn = e.target.closest(".js-open-modal");
    if (!btn) return;

    e.preventDefault();

    if (modalImg) modalImg.src = btn.dataset.img;
    if (modalInput) modalInput.value = btn.dataset.img;

    if (modal) {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
    }
  });

  if (modal) {
    modal.addEventListener("click", e => {
      if (
        e.target.classList.contains("modal-backdrop") ||
        e.target.classList.contains("modal-close")
      ) {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
      }
    });
  }


  /* =========================
     RGPD CHECK (ORIGINAL)
  ========================= */

  document.addEventListener("change", (e) => {

    if (e.target.id === "rgpd-check") {

      const btn = document.getElementById("go-to-payment");

      if (!btn) return;

      btn.disabled = !e.target.checked;
    }

  });


});


/* =========================
   MODAL HELPERS (ORIGINAL)
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
   ESC KEY (ORIGINAL)
========================= */

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const modal = document.querySelector(".modal.is-open");
  if (modal) closeModal(modal);
});
