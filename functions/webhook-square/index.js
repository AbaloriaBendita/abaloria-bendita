export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const body = await request.json();

    const payment = body?.data?.object?.payment;

    if (!payment) {
      return new Response("No payment", { status: 200 });
    }

    /* solo pagos completados */
    if (payment.status !== "COMPLETED") {
      return new Response("Ignored", { status: 200 });
    }

    /* =========================
       🚫 ANTI DUPLICADOS (KV)
    ========================= */

    const paymentId = payment.id;
    const key = `payment_${paymentId}`;

    if (env.PAYMENTS_KV) {

      const existing = await env.PAYMENTS_KV.get(key);

      if (existing) {
        console.log("⚠️ DUPLICADO:", paymentId);
        return new Response("Duplicate", { status: 200 });
      }

      await env.PAYMENTS_KV.put(key, "done", { expirationTtl: 86400 });
    }

    /* =========================
       DATOS
    ========================= */

    const nombre = payment.billing_address?.first_name || "Cliente";
    const apellidos = payment.billing_address?.last_name || "";
    const nombreCompleto = `${nombre} ${apellidos}`.trim();

    const email = payment.buyer_email_address || "";

    if (!email) {
      console.log("⚠️ Pago sin email");
    }

    const amount = payment.total_money.amount / 100;
    const receipt = payment.receipt_url || "";
    const orderId = payment.order_id || "";

    const referencia = `AB-${new Date().getFullYear()}-${Date.now()}`;

    console.log("📦 PEDIDO FINAL:", {
      email,
      nombre: nombreCompleto,
      amount,
      orderId
    });

    /* =========================
       1. EMAIL TIENDA
    ========================= */

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Abaloria Bendita <hola@abaloriabendita.es>",
        to: ["hola@abaloriabendita.es"],
        subject: `💰 Nuevo pedido · ${referencia}`,
        html: `
          <h2>Nuevo pedido confirmado</h2>
          <p><strong>Referencia:</strong> ${referencia}</p>
          <p><strong>Cliente:</strong> ${nombreCompleto}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Total:</strong> ${amount}€</p>
          <p><a href="${receipt}">Ver recibo</a></p>
        `
      })
    });

    console.log("📩 EMAIL TIENDA STATUS:", emailRes.status);

    /* =========================
       2. GOOGLE SHEETS
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
        pieza_id: orderId,
        origen: "square"
      })
    });

    /* =========================
       3. EMAIL CLIENTE
    ========================= */

    const clientRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Abaloria Bendita <hola@abaloriabendita.es>",
        to: [email],
        subject: "Tu pedido está confirmado ✨",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
            <h2>Gracias por tu compra</h2>
            <p>Hola ${nombre},</p>
            <p>Hemos recibido tu pedido correctamente.</p>
            <p><strong>Referencia:</strong> ${referencia}</p>
            <p><strong>Total:</strong> ${amount}€</p>
            <p><a href="${receipt}">Ver recibo</a></p>
            <p style="margin-top:20px">
              Te avisaremos cuando tu pedido esté preparado.
            </p>
          </div>
        `
      })
    });

    console.log("📩 EMAIL CLIENTE STATUS:", clientRes.status);

    return new Response("OK", { status: 200 });

  } catch (err) {

    console.error("❌ ERROR WEBHOOK:", err);

    return new Response("Error", { status: 500 });

  }

}
