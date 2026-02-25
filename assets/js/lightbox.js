document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("imageLightbox");
  if (!lightbox) return;

  const track = lightbox.querySelector(".lightbox-track");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-nav.prev");
  const nextBtn = lightbox.querySelector(".lightbox-nav.next");
  const counter = lightbox.querySelector(".lightbox-counter");
  const backdrop = lightbox.querySelector(".lightbox-backdrop");

  let currentIndex = 0;
  let images = [];

  function openLightbox(imgSources) {
    images = imgSources.filter(Boolean);
    if (!images.length) return;

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

    const many = images.length > 1;
    prevBtn.style.display = many ? "" : "none";
    nextBtn.style.display = many ? "" : "none";
    counter.style.display = many ? "" : "none";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function update() {
    const w = track.getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * w}px)`;
    counter.textContent = images.length > 1 ? `${currentIndex + 1} / ${images.length}` : "";
  }

  function go(delta) {
    const next = currentIndex + delta;
    if (next < 0 || next > images.length - 1) return;
    currentIndex = next;
    update();
  }

  // ✅ EVENT DELEGATION: funciona aunque las cards se pinten después
document.addEventListener("click", (e) => {
  const imgWrap = e.target.closest(".piece-image");
  if (!imgWrap) return;

  // Ignora clicks en CTAs
  if (e.target.closest(".piece-cta") || e.target.closest(".piece-cta-secondary")) return;

  const imgs = Array.from(imgWrap.querySelectorAll("img"))
    .map(i => i.currentSrc || i.src);

  openLightbox(imgs);
});
  
  prevBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); go(-1); });
  nextBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); go(+1); });

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
