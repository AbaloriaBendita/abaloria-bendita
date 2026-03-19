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
       DATOS
    ========================= */

    const nombre = payment.billing_address?.first_name || "";
    const apellidos = payment.billing_address?.last_name || "";
    const nombreCompleto = `${nombre} ${apellidos}`.trim();

    const email = payment.buyer_email_address || "";
    const amount = payment.total_money.amount / 100;
    const receipt = payment.receipt_url || "";
    const orderId = payment.order_id || "";

    const referencia = `AB-${new Date().getFullYear()}-${Date.now()}`;

    console.log("✅ PAGO:", email, amount);

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
        from: "Abaloria Bendita <hola@abaloriabendita.es>",
        to: ["hola@abaloriabendita.es"],
        subject: `💰 Venta confirmada · ${referencia}`,
        html: `
          <h2>Nuevo pedido pagado</h2>
          <p><strong>Referencia:</strong> ${referencia}</p>
          <p><strong>Cliente:</strong> ${nombreCompleto}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Total:</strong> ${amount}€</p>
          <p><a href="${receipt}">Ver recibo</a></p>
        `
      })
    });

    /* =========================
       2. GOOGLE SHEETS (TU SCRIPT)
    ========================= */

    await fetch("https://script.google.com/macros/s/AKfycbwGWwD-imsC7lTQ4V28oAIV9v4vOY4-9ASFoygglMsSIxxZs6ioM8imPn0syTSs_d_ITQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({

        tipo: "venta_online",
        referencia: referencia,
        fecha: new Date().toISOString(),

        nombre: nombreCompleto,
        email: email,
        telefono: "",
        direccion: "",

        pieza_id: orderId,
        origen: "square",

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
        tipo: "venta",
        referencia,
        receipt,
        amount
      })
    });

    return new Response("OK", { status: 200 });

  } catch (err) {

    console.error("ERROR:", err);

    return new Response("Error", { status: 500 });

  }

}
