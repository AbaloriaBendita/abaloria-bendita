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

    images = imgSources;
    track.innerHTML = "";

   images.forEach(src => {
  if (!src) return;

  const img = document.createElement("img");
  img.src = src;
  img.alt = "";

  img.onerror = () => {
    console.warn("Imagen no válida:", src);
  };

  track.appendChild(img);
});
    currentIndex = 0;
    update();

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const many = images.length > 1;
    prevBtn.style.display = many ? "" : "none";
    nextBtn.style.display = many ? "" : "none";
    counter.style.display = many ? "" : "none";
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

  requestAnimationFrame(() => {

    const w = track.getBoundingClientRect().width;
    if (!w) return;

    track.style.transform = `translateX(-${currentIndex * w}px)`;

    counter.textContent = images.length > 1
      ? `${currentIndex + 1} / ${images.length}`
      : "";
  });
}

  /* =========================
     EVENTO ÚNICO (pointer)
     Funciona en desktop + móvil
  ========================= */

  document.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startY = e.clientY;
  }, { passive: true });

  document.addEventListener("pointerup", (e) => {

    const imgWrap = e.target.closest(".piece-image");
    if (!imgWrap) return;

    if (e.target.closest(".piece-cta") || e.target.closest(".piece-cta-secondary")) return;

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);

    // Si hubo desplazamiento (scroll/swipe) → no abrir
    if (dx > 10 || dy > 10) return;

    // Obtener SOLO imágenes reales
    const main  = imgWrap.querySelector("img:not(.hover-img)");
    const hover = imgWrap.querySelector(".hover-img");

    const imgs = [];

    if (main && main.src)  imgs.push(main.src);
    if (hover && hover.src) imgs.push(hover.src);

    if (!imgs.length) return;

    openLightbox(imgs);

  });

  /* =========================
     CONTROLES
  ========================= */

  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    go(-1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    go(+1);
  });

  closeBtn.addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(+1);
  });

  window.addEventListener("resize", () => {
    if (lightbox.classList.contains("is-open")) update();
  });

});
