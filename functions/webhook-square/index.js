export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const body = await request.json();

    const payment = body?.data?.object?.payment;

    if (!payment) {
      return new Response("No payment", { status: 200 });
    }

    if (payment.status !== "COMPLETED") {
      return new Response("Ignored", { status: 200 });
    }

    /* =========================
       DATOS CLAVE
    ========================= */

    const email = payment.buyer_email_address || "no-email";
    const amount = payment.total_money.amount / 100;
    const receipt = payment.receipt_url || "";
    const orderId = payment.order_id || "";
    const nombre = payment.billing_address?.first_name || "";
    const apellido = payment.billing_address?.last_name || "";

    console.log("✅ PAGO OK:", email, amount);

    /* =========================
       1. EMAIL INTERNO
    ========================= */

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Pedidos <pedidos@abaloriabendita.es>",
        to: ["hola@abaloriabendita.es"],
        subject: "💰 Nuevo pedido pagado",
        html: `
          <h2>Nuevo pedido</h2>
          <p><strong>Cliente:</strong> ${nombre} ${apellido}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Total:</strong> ${amount}€</p>
          <p><a href="${receipt}">Ver recibo</a></p>
        `
      })
    });

    /* =========================
       2. GOOGLE SHEETS
    ========================= */

    await fetch(env.GSHEET_WEBHOOK_URL, {
      method: "POST",
      body: JSON.stringify({
        nombre,
        apellido,
        email,
        amount,
        orderId,
        receipt
      })
    });

    /* =========================
       3. EMAIL CLIENTE
    ========================= */

    await fetch(env.EMAIL_WORKER_URL, {
      method: "POST",
      body: JSON.stringify({
        email,
        nombre,
        amount,
        receipt,
        tipo: "venta"
      })
    });

    return new Response("OK", { status: 200 });

  } catch (err) {

    console.error("ERROR:", err);

    return new Response("Error", { status: 500 });

  }
}
