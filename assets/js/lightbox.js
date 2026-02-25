document.addEventListener('DOMContentLoaded', function(){

  const lightbox = document.getElementById('imageLightbox');
  if (!lightbox) return;

  const track = lightbox.querySelector('.lightbox-track');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.prev');
  const nextBtn = lightbox.querySelector('.next');
  const counter = lightbox.querySelector('.lightbox-counter');

  let currentIndex = 0;
  let images = [];

  // 🔥 EVENT DELEGATION GLOBAL
  document.addEventListener('click', function(e){

    const frame = e.target.closest('.collection-frame');
    if (!frame) return;

    // Ignorar clicks en flechas o CTA
    if (e.target.closest('.nav') || 
        e.target.closest('.collection-cta-overlay')) {
      return;
    }

    images = Array.from(frame.querySelectorAll('.img-item img'))
      .map(img => img.src);

    if (!images.length) return;

    track.innerHTML = '';

    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      track.appendChild(img);
    });

    currentIndex = 0;
    updateSlide();
    updateCounter();

    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';

  });

  function updateSlide(){
    const width = track.clientWidth;
    track.style.transform = `translateX(-${currentIndex * width}px)`;
  }

  function updateCounter(){
    if(images.length > 1){
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
    } else {
      counter.textContent = '';
    }
  }

  prevBtn.addEventListener('click', function(){
    if(currentIndex > 0){
      currentIndex--;
      updateSlide();
      updateCounter();
    }
  });

  nextBtn.addEventListener('click', function(){
    if(currentIndex < images.length - 1){
      currentIndex++;
      updateSlide();
      updateCounter();
    }
  });

  function closeLightbox(){
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-backdrop')
    .addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('is-open')) return;

    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft' && currentIndex > 0){
      currentIndex--;
      updateSlide();
      updateCounter();
    }
    if(e.key === 'ArrowRight' && currentIndex < images.length - 1){
      currentIndex++;
      updateSlide();
      updateCounter();
    }
  });

});
