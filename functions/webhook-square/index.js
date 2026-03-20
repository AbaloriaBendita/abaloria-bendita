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
       ANTI DUPLICADOS
    ========================= */

    const paymentId = payment.id;
    const key = `payment_${paymentId}`;

    if (env.PAYMENTS_KV) {
      const existing = await env.PAYMENTS_KV.get(key);
      if (existing) return new Response("Duplicate", { status: 200 });

      await env.PAYMENTS_KV.put(key, "done", { expirationTtl: 86400 });
    }

    /* =========================
       DATOS
    ========================= */

    const billing = payment.billing_address || {};

    const nombre = billing.first_name || "Cliente";
    const apellidos = billing.last_name || "";
    const nombreCompleto = `${nombre} ${apellidos}`.trim();

    const email = payment.buyer_email_address || "";
    const telefono = billing.phone || payment.phone_number || "";

    const direccion = [
      billing.address_line_1,
      billing.address_line_2,
      billing.locality,
      billing.administrative_district_level_1,
      billing.postal_code,
      billing.country
    ].filter(Boolean).join(", ");

    const amount = payment.total_money.amount / 100;
    const receipt = payment.receipt_url || "";
    const orderId = payment.order_id || "";
    const isCompra = !!orderId;

    const referencia = `AB-${new Date().getFullYear()}-${Date.now()}`;

    console.log("📦 PEDIDO:", {
      nombreCompleto,
      email,
      telefono,
      direccion,
      amount
    });

    /* =========================
       EMAIL TIENDA
    ========================= */

    try {

      const res = await fetch("https://api.resend.com/emails", {
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
            <h2>Nuevo pedido</h2>
            <p><strong>Referencia:</strong> ${referencia}</p>
            <p><strong>Cliente:</strong> ${nombreCompleto}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Dirección:</strong> ${direccion}</p>
            <p><strong>Total:</strong> ${amount}€</p>
            <p><a href="${receipt}">Ver recibo</a></p>
          `
        })
      });

      const data = await res.json();
      console.log("📩 TIENDA:", res.status, data);

    } catch (err) {
      console.error("❌ ERROR EMAIL TIENDA:", err);
    }

    /* =========================
       GOOGLE SHEETS
    ========================= */

    try {

      await fetch("https://script.google.com/macros/s/AKfycbwGWwD-imsC7lTQ4V28oAIV9v4vOY4-9ASFoygglMsSIxxZs6ioM8imPn0syTSs_d_ITQ/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tipo: "venta_online",
          referencia,
          fecha: new Date().toISOString(),
          nombre: nombreCompleto,
          email,
          telefono,
          direccion,
          importe: amount,
          pieza_id: orderId,
          origen: "square"
        })
      });

      console.log("📊 Sheets OK");

    } catch (err) {
      console.error("❌ ERROR SHEETS:", err);
    }

    /* =========================
       EMAIL CLIENTE
    ========================= */

    if (email) {
      try {

        const res = await fetch("https://api.resend.com/emails", {
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

        const data = await res.json();
        console.log("📩 CLIENTE:", res.status, data);

      } catch (err) {
        console.error("❌ ERROR EMAIL CLIENTE:", err);
      }
    }

    return new Response("OK", { status: 200 });

  } catch (err) {

    console.error("❌ ERROR WEBHOOK:", err);

    return new Response("Error", { status: 500 });

  }

}
