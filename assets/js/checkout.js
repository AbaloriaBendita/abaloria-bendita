/* =========================
   HELPERS · CARRITO CHECKOUT
========================= */

function getCheckoutCart() {
  const mode = localStorage.getItem("checkout_mode");

  if (mode === "single") {
    return JSON.parse(localStorage.getItem("checkout_single") || "[]");
  }

  return JSON.parse(localStorage.getItem("abaloria_cart") || "[]");
}

function getCartSubtotal(cart) {
  return (Array.isArray(cart) ? cart : []).reduce((total, item) => {
    const qty = Number(item?.qty) || 1;
    return total + (Number(item?.precio) || 0) * qty;
  }, 0);
}

function getSelectedShippingZone() {
  return document.querySelector(
    'input[name="shipping_zone"]:checked'
  )?.value || "peninsula";
}

function syncPaymentButton() {
  const payBtn = document.getElementById("go-to-payment");
  const rgpdCheck = document.getElementById("rgpd-check");
  const shippingZone = getSelectedShippingZone();

  if (!payBtn) return;

  const acceptedRgpd = Boolean(rgpdCheck?.checked);
  const requiresQuote = shippingZone === "quote";

  payBtn.disabled = !acceptedRgpd || requiresQuote;
}

function resetPrepagoState() {
  const rgpdCheck = document.getElementById("rgpd-check");
  const peninsulaRadio = document.querySelector(
    'input[name="shipping_zone"][value="peninsula"]'
  );

  if (rgpdCheck) rgpdCheck.checked = false;
  if (peninsulaRadio) peninsulaRadio.checked = true;
}


/* =========================
   SHIPPING OPTIONS UI
========================= */

function syncShippingZoneOptions(cart) {
  const subtotal = getCartSubtotal(cart);
  const freeFrom = Number(window.SHIPPING_CONFIG?.freeFrom) || 120;
  const hasFreeShipping = subtotal >= freeFrom;

  const peninsulaOption = document.querySelector('[data-shipping-option="peninsula"]');
  const balearesOption = document.querySelector('[data-shipping-option="baleares"]');
  const canariasOption = document.querySelector('[data-shipping-option="canarias"]');
  const peninsulaRadio = peninsulaOption?.querySelector('input[name="shipping_zone"]');
  const peninsulaName = peninsulaOption?.querySelector(".shipping-zone-name");
  const peninsulaPrice = peninsulaOption?.querySelector(".shipping-zone-price");
  const quoteRadio = document.querySelector('input[name="shipping_zone"][value="quote"]');
  const helpEl = document.querySelector(".shipping-zone-help");

  if (!peninsulaOption || !balearesOption || !canariasOption || !peninsulaRadio) {
    return;
  }

  if (hasFreeShipping) {
    balearesOption.style.display = "none";
    canariasOption.style.display = "none";

    if (peninsulaName) {
      peninsulaName.textContent = isEN ? "Spain" : "España";
    }

    if (peninsulaPrice) {
      peninsulaPrice.textContent = isEN ? "Free" : "Gratis";
    }

    if (helpEl) {
      helpEl.textContent = isEN
        ? "Free shipping within Spain."
        : "Envío gratis en España.";
    }

    if (!quoteRadio?.checked) {
      peninsulaRadio.checked = true;
    }

  } else {
    balearesOption.style.display = "flex";
    canariasOption.style.display = "flex";

    if (peninsulaName) {
      peninsulaName.textContent = isEN ? "Mainland Spain" : "Península";
    }

    if (peninsulaPrice) {
      peninsulaPrice.textContent = isEN ? "€8.50" : "8,50 €";
    }

    if (helpEl) {
      helpEl.textContent = isEN
        ? "Free shipping on orders from €120."
        : "Envío gratis a partir de 120 €.";
    }
  }
}

function renderShippingQuoteMessage(messageEl) {
  if (!messageEl) return;

  const href = isEN ? "/en/#encargo" : "/#encargo";

  messageEl.innerHTML = isEN
    ? `For Ceuta, Melilla and destinations outside Spain, please contact us before placing the order. <a href="${href}">Write to us here</a>.`
    : `Para Ceuta, Melilla y envíos fuera de España, consúltanos antes de realizar el pedido. <a href="${href}">Escríbenos aquí</a>.`;
}


/* =========================
   PREPAGO GALLERY
========================= */

function renderPrepagoGallery(cart) {
  const preview = document.getElementById("prepago-img-preview");
  const thumbnails = document.getElementById("prepago-thumbnails");

  if (!preview || !thumbnails) return;

  const products = (Array.isArray(cart) ? cart : [])
    .filter(item => item && item.img);

  thumbnails.innerHTML = "";

  if (!products.length) {
    preview.src = "";
    preview.alt = "";
    thumbnails.style.display = "none";
    return;
  }

  preview.src = products[0].img;
  preview.alt = products[0].titulo || "Producto";

  if (products.length <= 1) {
    thumbnails.style.display = "none";
    return;
  }

  thumbnails.style.display = "flex";

  products.forEach((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute(
      "aria-label",
      `${isEN ? "View" : "Ver"} ${product.titulo || (isEN ? "product" : "producto")}`
    );
    button.setAttribute("aria-pressed", index === 0 ? "true" : "false");

    button.style.cssText = `
      flex:0 0 auto;
      width:54px;
      height:54px;
      padding:2px;
      border-radius:10px;
      border:2px solid ${index === 0 ? "#0F3D2E" : "rgba(0,0,0,.15)"};
      background:#fff;
      cursor:pointer;
      opacity:${index === 0 ? "1" : ".72"};
    `;

    const img = document.createElement("img");
    img.src = product.img;
    img.alt = "";
    img.style.cssText = `
      width:100%;
      height:100%;
      object-fit:cover;
      border-radius:7px;
      display:block;
    `;

    button.appendChild(img);

    button.addEventListener("click", () => {
      preview.src = product.img;
      preview.alt = product.titulo || "Producto";

      Array.from(thumbnails.children).forEach(child => {
        child.setAttribute("aria-pressed", "false");
        child.style.borderColor = "rgba(0,0,0,.15)";
        child.style.opacity = ".72";
      });

      button.setAttribute("aria-pressed", "true");
      button.style.borderColor = "#0F3D2E";
      button.style.opacity = "1";
    });

    thumbnails.appendChild(button);
  });
}

window.renderPrepagoGallery = renderPrepagoGallery;


/* =========================
   PREPAGO SUMMARY (UI)
========================= */

function renderPrepagoSummary(){

  const cart = getCheckoutCart();
  if (!cart.length) return;

  syncShippingZoneOptions(cart);

  const shippingZone = getSelectedShippingZone();
  const totales = calcularTotales(cart, shippingZone);

  const subtotalEl = document.querySelector(".prepago-subtotal");
  const ivaEl = document.querySelector(".prepago-iva");
  const shippingEl = document.querySelector(".prepago-shipping");
  const totalEl = document.querySelector(".prepago-total");
  const messageEl = document.getElementById("shipping-zone-message");

  if (subtotalEl) subtotalEl.textContent = totales.subtotal.toFixed(2) + " €";
  if (ivaEl) ivaEl.textContent = totales.iva.toFixed(2) + " €";

  if (totales.shipping === null) {
    if (shippingEl) shippingEl.textContent = TEXTS.checkout.shippingQuote;
    if (totalEl) totalEl.textContent = "—";
    renderShippingQuoteMessage(messageEl);
  } else {
    if (shippingEl) {
      shippingEl.textContent =
        totales.shipping === 0
          ? TEXTS.cart.shippingFree
          : totales.shipping.toFixed(2) + " €";
    }

    if (totalEl) totalEl.textContent = totales.total.toFixed(2) + " €";
    if (messageEl) messageEl.innerHTML = "";
  }

  syncPaymentButton();
}

window.renderPrepagoSummary = renderPrepagoSummary;


/* =========================
   RGPD + SHIPPING (DELEGADO)
========================= */

document.addEventListener("change", (e) => {

  if (
    e.target.id === "rgpd-check" ||
    e.target.name === "shipping_zone"
  ) {
    renderPrepagoSummary();
  }

});


/* =========================
   CLICK GLOBAL CHECKOUT
========================= */

document.addEventListener("click", async (e) => {

  /* =========================
     ABRIR MODAL PREPAGO
  ========================= */

  const prepagoBtn = e.target.closest(".js-prepago");

  if (prepagoBtn) {

    const producto = {
      id: prepagoBtn.dataset.id,
      titulo: prepagoBtn.dataset.title,
      precio: Number(prepagoBtn.dataset.price),
      img: prepagoBtn.dataset.img,
      qty: 1
    };

    localStorage.setItem("checkout_mode", "single");
    localStorage.setItem("checkout_single", JSON.stringify([producto]));

    const modal = document.getElementById("modal-prepago");

    if (!modal) return;

    resetPrepagoState();
    renderPrepagoGallery([producto]);
    renderPrepagoSummary();
    openModal(modal);

    return;
  }


  /* =========================
     CTA PAGO (DELEGADO)
  ========================= */

  const payBtn = e.target.closest("#go-to-payment");

  if (payBtn) {

    if (payBtn.disabled) return;

    const cart = getCheckoutCart();
    const shippingZone = getSelectedShippingZone();

    if (!cart.length) {
      alert(TEXTS.checkout.empty);
      return;
    }

    if (shippingZone === "quote") {
      alert(TEXTS.checkout.shippingQuoteMessage);
      return;
    }

    window.dataLayer = window.dataLayer || [];

    const total = cart.reduce((acc, item) => acc + item.precio * (item.qty || 1), 0);
    const lang = typeof isEN !== "undefined" && isEN ? "en" : "es";
    const mode = localStorage.getItem("checkout_mode") || "cart";

    window.dataLayer.push({
      event: 'begin_checkout',
      value: total,
      currency: 'EUR',
      items: cart.length,
      checkout_type: mode,
      shipping_zone: shippingZone,
      lang: lang
    });

    payBtn.innerText = TEXTS.checkout.redirecting;
    payBtn.disabled = true;

    try {

      console.log("🧾 CHECKOUT:", cart, shippingZone);

      const res = await fetch("https://pago-square.hola-38b.workers.dev", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          shipping_zone: shippingZone,
          cart: cart.map(item => ({
            id: item.id,
            titulo: item.titulo,
            precio: item.precio,
            qty: item.qty || 1,
            img: item.img
          }))
        })
      });

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok || !data.payment_url) {
        throw new Error(data?.message || data?.error || "Checkout error");
      }

      window.location.href = data.payment_url;

    } catch (err) {

      console.error("❌ ERROR CHECKOUT:", err);
      alert(TEXTS.checkout.error);
      payBtn.innerText = isEN
        ? "Continue purchase"
        : "Continuar compra";
      syncPaymentButton();
    }

    return;
  }


  /* =========================
     CERRAR MODALES
  ========================= */

  const closeBtn = e.target.closest(".modal-close");
  const backdrop = e.target.classList.contains("modal-backdrop");

  if (closeBtn || backdrop) {
    const modal = e.target.closest(".modal");
    if (modal) closeModal(modal);
  }

});
