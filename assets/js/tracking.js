document.addEventListener('DOMContentLoaded', () => {

  const lang = window.location.pathname.startsWith("/en") ? "en" : "es";

  // SELECT ITEM
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {

      const collection = document.body.dataset.collection || 'unknown';

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'select_item',
        collection: collection,
        lang: lang
      });
    });
  });

  // CTA CLICK
  document.querySelectorAll('.cta-pill, .cta-main').forEach(btn => {
    btn.addEventListener('click', () => {

      const collection = document.body.dataset.collection || 'unknown';

      window.dataLayer.push({
        event: 'cta_click',
        location: 'collection',
        collection: collection,
        lang: lang
      });
    });
  });

});
