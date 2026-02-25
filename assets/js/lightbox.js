document.addEventListener("DOMContentLoaded", () => {

  const lightbox = document.getElementById("imageLightbox");
  if (!lightbox) return;

  const track     = lightbox.querySelector(".lightbox-track");
  const closeBtn  = lightbox.querySelector(".lightbox-close");
  const prevBtn   = lightbox.querySelector(".lightbox-nav.prev");
  const nextBtn   = lightbox.querySelector(".lightbox-nav.next");
  const counter   = lightbox.querySelector(".lightbox-counter");
  const backdrop  = lightbox.querySelector(".lightbox-backdrop");

  let currentIndex = 0;
  let images = [];
  let startX = 0;
  let startY = 0;

  /* =========================
     ABRIR LIGHTBOX
  ========================= */

  function openLightbox(imgSources) {

    if (!imgSources || !imgSources.length) return;

    images = imgSources.filter(Boolean);
    track.innerHTML = "";

    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      track.appendChild(img);
    });

    currentIndex = 0;
    update();

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    updateControls();
  }

  /* =========================
     CERRAR
  ========================= */

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  /* =========================
     ACTUALIZAR SLIDE
  ========================= */

  function update() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    counter.textContent = images.length > 1
      ? `${currentIndex + 1} / ${images.length}`
      : "";
  }

  function updateControls() {
    const many = images.length > 1;

    prevBtn.style.display = many ? "" : "none";
    nextBtn.style.display = many ? "" : "none";
    counter.style.display = many ? "" : "none";
  }

  /* =========================
     CAMBIAR SLIDE
  ========================= */

  function go(delta) {

    if (!images.length) return;

    currentIndex += delta;

    if (currentIndex < 0) {
      currentIndex = 0; // evita salir por la izquierda
    }

    if (currentIndex > images.length - 1) {
      currentIndex = images.length - 1; // evita salir por la derecha
    }

    update();
  }

  /* =========================
     EVENTO CLICK EN IMAGEN
  ========================= */

  document.addEventListener("click", (e) => {

    const imgWrap = e.target.closest(".piece-image");
    if (!imgWrap) return;

    if (e.target.closest(".piece-cta") || e.target.closest(".piece-cta-secondary")) return;

    const main  = imgWrap.querySelector("img:not(.hover-img)");
    const hover = imgWrap.querySelector(".hover-img");

    const imgs = [];

    if (main?.src) imgs.push(main.src);
    if (hover?.src) imgs.push(hover.src);

    if (!imgs.length) return;

    openLightbox(imgs);
  });

  /* =========================
     CONTROLES
  ========================= */

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    go(-1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    go(1);
  });

  closeBtn.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

});
