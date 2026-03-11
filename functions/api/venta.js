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
    const finalTotal = Number((total + shipping).toFixed(2));

    /* =========================
       DESCRIPCIÓN
    ========================= */

    const description = cart
      .map(p => `${p.titulo} x${p.qty || 1}`)
      .join(", ");

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

        amount: finalTotal,

        currency: "EUR",

        description,

        merchant_code: env.SUMUP_MERCHANT,

        redirect_url: "https://abaloriabendita.es/gracias.html"

      })

    });

    const data = await res.json();

    console.log("SUMUP RESPONSE:", data);

    if (!data.id) {

      return new Response(JSON.stringify({
        error: "Checkout creation failed",
        sumup_response: data
      }), { status: 500 });

    }

    /* =========================
       URL DE PAGO
    ========================= */

    const paymentUrl = `https://checkout.sumup.com/${data.id}`;

    return new Response(JSON.stringify({
      payment_url: paymentUrl
    }), {
      headers: { "Content-Type": "application/json" }
    });

  }

  catch (err) {

    console.error("SERVER ERROR:", err);

    return new Response(JSON.stringify({
      error: "Server error"
    }), { status: 500 });

  }

}
