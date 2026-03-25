document.addEventListener('DOMContentLoaded', () => {

  window.dataLayer = window.dataLayer || [];

  const lang = window.location.pathname.startsWith("/en") ? "en" : "es";
  const collection = document.body.dataset.collection || 'unknown';

  // SELECT ITEM
  if (document.querySelectorAll('.product-card').length) {
    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        window.dataLayer.push({
          event: 'select_item',
          collection: collection,
          lang: lang
        });
      });
    });
  }

  // CTA CLICK
  document.querySelectorAll('.cta-pill, .cta-main').forEach(btn => {
    btn.addEventListener('click', () => {
      window.dataLayer.push({
        event: 'cta_click',
        location: 'collection',
        collection: collection,
        lang: lang
      });
    });
  });

  // LEAD (solo forms principales)
  document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', () => {
      window.dataLayer.push({
        event: 'lead_form_submit',
        lang: lang
      });
    });
  });

});
