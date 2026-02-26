document.addEventListener("DOMContentLoaded", () => {

  const lightbox = document.getElementById("imageLightbox");
  if (!lightbox) return;
  // Seguridad: asegurar que arranca cerrado
  lightbox.classList.remove("is-open");

  const content  = lightbox.querySelector(".lightbox-content");
  const track    = lightbox.querySelector(".lightbox-track");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn  = lightbox.querySelector(".lightbox-nav.prev");
  const nextBtn  = lightbox.querySelector(".lightbox-nav.next");
  const counter  = lightbox.querySelector(".lightbox-counter");
  const backdrop = lightbox.querySelector(".lightbox-backdrop");

  let currentIndex = 0;
  let images = [];

  function updateControls() {

  const total = images.length;

  // Mostrar flechas solo cuando corresponda
  prevBtn.style.display = (currentIndex > 0) ? "block" : "none";
  nextBtn.style.display = (currentIndex < total - 1) ? "block" : "none";

  // Mostrar contador solo si hay más de una imagen
  counter.style.display = total > 1 ? "block" : "none";
}

 function update() {

  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  counter.textContent = images.length > 1
    ? `${currentIndex + 1} / ${images.length}`
    : "";

  updateControls();
}

  function openLightbox(imgSources) {
    images = (imgSources || []).filter(Boolean);
    if (!images.length) return;

    track.innerHTML = "";

    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      track.appendChild(img);
    });

    currentIndex = 0;

    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // espera a que el DOM pinte antes de medir
    requestAnimationFrame(update);
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function go(delta) {
    if (!images.length) return;

    const next = currentIndex + delta;
    if (next < 0 || next > images.length - 1) return;

    currentIndex = next;
    update();
  }

  // CLICK en imagen del catálogo -> abrir
  document.addEventListener("click", (e) => {

    // Si el lightbox está abierto, NO reacciones a clicks “debajo”
    if (lightbox.classList.contains("is-open")) return;

    const imgWrap = e.target.closest(".piece-image");
    if (!imgWrap) return;

    if (e.target.closest(".piece-cta") || e.target.closest(".piece-cta-secondary")) return;

    const main  = imgWrap.querySelector("img:not(.hover-img)");
    const hover = imgWrap.querySelector(".hover-img");

    const imgs = [];
    if (main?.currentSrc || main?.src)  imgs.push(main.currentSrc || main.src);
    if (hover?.currentSrc || hover?.src) imgs.push(hover.currentSrc || hover.src);

    openLightbox(imgs);
  });

  // Controles
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    go(-1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    go(1);
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeLightbox();
  });

  backdrop.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  });

  window.addEventListener("resize", () => {
    if (lightbox.classList.contains("is-open")) update();
  });

});
