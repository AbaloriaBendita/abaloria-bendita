export function onRequestGet() {
  return new Response("PAGO OK");
}

export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    console.log("TOKEN:", env.SQUARE_ACCESS_TOKEN);

    /* =========================
       TEST LOCATIONS (DEBUG)
    ========================= */

    const test = await fetch("https://connect.squareup.com/v2/locations", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-06-04"
      }
    });

    const testText = await test.text();
    console.log("LOCATIONS TEST:", testText);

    /* =========================
       CONTINÚA TU LÓGICA
    ========================= */

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

    let total = 0;

    cart.forEach(p => {
      const qty = p.qty || 1;
      total += Number(p.precio) * qty;
    });

    const shipping = total < 150 ? 8.5 : 0;
    const finalTotal = Number((total + shipping).toFixed(2));

    const description = cart
      .map(p => `${p.titulo} x${p.qty || 1}`)
      .join(", ");

    console.log("ORDER ID:", orderId);
    console.log("TOTAL:", finalTotal);

    const res = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Square-Version": "2024-06-04"
  },
  body: JSON.stringify({
    idempotency_key: crypto.randomUUID(),

    quick_pay: {
      name: description || "Abaloria Bendita",
      price_money: {
        amount: Math.round(finalTotal * 100),
        currency: "EUR"
      },
      location_id: "LF3CF7RXP1BDT"
    },

    checkout_options: {
      redirect_url: `https://abaloriabendita.es/gracias.html?tipo=venta&order=${orderId}`,
      ask_for_shipping_address: false,
      ask_for_email: true,
      allow_tipping: false
    }
  })
});
    
    if (!res.ok) {

      const err = await res.text();
      console.error("SQUARE API ERROR:", err);

      return new Response(JSON.stringify({
        error: "Square API error",
        details: err
      }), { status: 500 });

    }

    const data = await res.json();

    console.log("SQUARE RESPONSE:", data);

    if (!data.payment_link || !data.payment_link.url) {
      throw new Error("No payment link returned");
    }

    const paymentUrl = data.payment_link.url;

    console.log("PAYMENT URL:", paymentUrl);

    return new Response(JSON.stringify({
      payment_url: paymentUrl,
      order_id: orderId
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {

    console.error("SERVER ERROR:", err);

    return new Response(JSON.stringify({
      error: "Server error",
      message: err.message
    }), { status: 500 });

  }

}
