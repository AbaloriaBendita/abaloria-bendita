document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     NAV MOBILE
  ========================= */
  const toggle = document.querySelector(".nav-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  /* =========================
     CART PANEL
  ========================= */
  const cartButton = document.getElementById("cart-open");
  const cartPanel = document.getElementById("cartPanel");
  const cartClose = document.querySelector(".cart-close");
  const cartBackdrop = document.querySelector(".cart-backdrop");

  if (cartButton && cartPanel) {

   cartButton.addEventListener("click", (e) => {
  e.preventDefault();

  if (!cartPanel) return;

  cartPanel.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
});

   const closeCart = () => {
  if (!cartPanel) return;

  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
};

    cartClose?.addEventListener("click", closeCart);
    cartBackdrop?.addEventListener("click", closeCart);
  }

  /* =========================
     MODAL ENCARGO
  ========================= */
  const encargoModal = document.getElementById("modal-encargo");
  const modalImg = document.getElementById("modal-img-preview");
  const modalInput = document.getElementById("modal-img-input");

  document.addEventListener("click", e => {

    const btn = e.target.closest(".js-open-modal");
    if (!btn) return;

    e.preventDefault();

    if (modalImg) modalImg.src = btn.dataset.img;
    if (modalInput) modalInput.value = btn.dataset.img;

    openModal(encargoModal);
  });

  /* =========================
     CLOSE MODALS GENERICO
  ========================= */
  document.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("modal-backdrop") ||
      e.target.classList.contains("modal-close")
    ) {
      closeModal(e.target.closest(".modal"));
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const modal = document.querySelector(".modal.is-open");
    if (modal) closeModal(modal);
  });

  /* =========================
     RGPD CHECK
  ========================= */
  document.addEventListener("change", (e) => {
    if (e.target.id === "rgpd-check") {
      const btn = document.getElementById("go-to-payment");
      if (btn) btn.disabled = !e.target.checked;
    }
  });

});


/* =========================
   HELPERS GLOBALES
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
