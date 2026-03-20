export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const formData = await request.formData();
    const cartRaw = formData.get("cart");

    let cart = [];

    if (cartRaw) {
      cart = JSON.parse(cartRaw);
    }

    if (!cart.length) {
      return new Response(JSON.stringify({
        error: "Cart vacío"
      }), { status: 400 });
    }

    const orderId = crypto.randomUUID();

    /* =========================
       LINE ITEMS
    ========================= */

    const line_items = cart.map(p => ({
      name: p.titulo,
      quantity: String(p.qty || 1),
      base_price_money: {
        amount: Math.round(Number(p.precio) * 100),
        currency: "EUR"
      }
    }));

    /* =========================
       SUBTOTAL
    ========================= */

    let subtotal = 0;

    cart.forEach(p => {
      const qty = p.qty || 1;
      subtotal += Number(p.precio) * qty;
    });

    /* =========================
       ENVÍO
    ========================= */

    const shippingAmount = subtotal >= 150 ? 0 : 8.5;

    const service_charges = shippingAmount > 0 ? [{
      name: "Envío",
      amount_money: {
        amount: Math.round(shippingAmount * 100),
        currency: "EUR"
      },
      calculation_phase: "SUBTOTAL_PHASE"
    }] : [];

    /* =========================
       SQUARE CHECKOUT
    ========================= */

    const res = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-06-04"
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),

        order: {
          location_id: "LF3CF7RXP1BDT",
          line_items,
          service_charges
        },

        checkout_options: {
          redirect_url: `https://abaloriabendita.es/gracias.html?order=${orderId}`,
          ask_for_email: true,
          ask_for_shipping_address: true
        }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({
        error: "Square error",
        details: err
      }), { status: 500 });
    }

    const data = await res.json();

    return new Response(JSON.stringify({
      payment_url: data.payment_link.url,
      order_id: orderId
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {

    return new Response(JSON.stringify({
      error: "Server error",
      message: err.message
    }), { status: 500 });

  }

}
