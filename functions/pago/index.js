export function onRequestGet() {
  return new Response("PAGO OK");
}

export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    /* =========================
       RECIBIR FORM DATA
    ========================= */

    const formData = await request.formData();
    const cartRaw = formData.get("cart");

    let cart = [];

    if (cartRaw) {
      cart = JSON.parse(cartRaw);
    }

    /* =========================
       ORDER ID
    ========================= */

    const orderId = crypto.randomUUID();

    /* =========================
       CALCULAR TOTAL
    ========================= */

    let total = 0;

    cart.forEach(p => {
      const qty = p.qty || 1;
      total += Number(p.precio) * qty;
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
       DEBUG
    ========================= */

    console.log("ORDER ID:", orderId);
    console.log("TOTAL:", finalTotal);

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

        checkout_reference: orderId,

        amount: finalTotal,

        currency: "EUR",

merchant_code: "M78J89QZ",
        
        description: description,

        customer_email: formData.get("email"),

        return_url: `https://abaloriabendita.es/gracias.html?tipo=venta&order=${orderId}`

      })

    });

    /* =========================
       CONTROL ERROR API
    ========================= */

    if (!res.ok) {

      const err = await res.text();

      console.error("SUMUP API ERROR:", err);

      return new Response(JSON.stringify({
        error: "SumUp API error",
        details: err
      }), { status: 500 });

    }

    /* =========================
       RESPUESTA SUMUP
    ========================= */

    const text = await res.text();
    console.log("SUMUP RAW RESPONSE:", text);

    const data = JSON.parse(text);

    if (!data.id) {

      return new Response(JSON.stringify({
        error: "SumUp did not return checkout id",
        sumup_response: data
      }), { status: 500 });

    }

    /* =========================
       URL PAGO
    ========================= */

   /* =========================
   URL PAGO
========================= */

const paymentUrl = `https://pay.sumup.com/b2c/${data.id}`;

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
      error: "Server error"
    }), { status: 500 });

  }

}
