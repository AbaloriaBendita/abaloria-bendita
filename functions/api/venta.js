export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const formData = await request.formData();

    const cartRaw = formData.get("cart");

    if (!cartRaw) {
      return new Response(JSON.stringify({ error: "Carrito vacío" }), { status: 400 });
    }

    const cart = JSON.parse(cartRaw);

    /* =========================
       CALCULAR TOTAL
    ========================= */

    let total = 0;

    cart.forEach(p => {
      const qty = p.qty || 1;
      total += p.precio * qty;
    });

    const shipping = total < 150 ? 8.5 : 0;
    const finalTotal = total + shipping;

    /* =========================
       DESCRIPCIÓN PEDIDO
    ========================= */

    const items = cart
      .map(p => `${p.titulo} x${p.qty || 1}`)
      .join(", ");

    const description = `Pedido Abaloria Bendita: ${items}`;

    /* =========================
       CREAR CHECKOUT SUMUP
    ========================= */

    const res = await fetch("https://api.sumup.com/v0.1/checkouts", {

      method: "POST",

      headers: {
        Authorization: `Bearer ${env.SUMUP_API_KEY}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        checkout_reference: crypto.randomUUID(),
        amount: Number(finalTotal.toFixed(2)),
        currency: "EUR",
        description
      })

    });

    const text = await res.text();

    console.log("SUMUP RAW:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }

    console.log("SUMUP PARSED:", data);

    /* =========================
       OBTENER URL PAGO
    ========================= */

    const paymentUrl =
      data.checkout_url ||
      data.hosted_checkout_url ||
      data.url;

    if (!paymentUrl) {

      return new Response(JSON.stringify({
        error: "No checkout URL",
        sumup_response: data
      }), { status: 500 });

    }

    /* =========================
       RESPUESTA FRONTEND
    ========================= */

    return new Response(JSON.stringify({
      payment_url: paymentUrl
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {

    console.error("SERVER ERROR:", err);

    return new Response(JSON.stringify({
      error: "Server error"
    }), { status: 500 });

  }

}
