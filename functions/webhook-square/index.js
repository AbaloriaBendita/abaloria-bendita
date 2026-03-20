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
       DATOS BASE
    ========================= */

    const billing = payment.billing_address || {};

    let nombre = billing.first_name || "Cliente";
    let apellidos = billing.last_name || "";
    let nombreCompleto = `${nombre} ${apellidos}`.trim();

    let email = payment.buyer_email_address || "";
    let telefono = billing.phone || payment.phone_number || "No facilitado";

    let direccion = [
      billing.address_line_1,
      billing.address_line_2,
      billing.locality,
      billing.administrative_district_level_1,
      billing.postal_code,
      billing.country
    ].filter(Boolean).join(", ") || "No facilitada";

    const amount = payment.total_money.amount / 100;
    const receipt = payment.receipt_url || "";
    const orderId = payment.order_id || "";
  const squareOrderUrl = orderId
  ? `https://app.squareup.com/dashboard/orders/overview/${orderId}`
  : "";
    const referencia = `AB-${new Date().getFullYear()}-${Date.now()}`;

    /* =========================
       CUSTOMER API (🔥 NUEVO)
    ========================= */

    const customerId = payment.customer_id;

    console.log("👤 CUSTOMER ID:", customerId);

    if (customerId) {
      try {

        const customerRes = await fetch(`https://connect.squareup.com/v2/customers/${customerId}`, {
          headers: {
            "Authorization": `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
            "Square-Version": "2024-06-04"
          }
        });

        const customerData = await customerRes.json();

        console.log("👤 CUSTOMER DATA:", customerData);

        const customer = customerData.customer;

        if (customer) {

          nombre = customer.given_name || nombre;
          apellidos = customer.family_name || apellidos;
          nombreCompleto = `${nombre} ${apellidos}`.trim();

          email = customer.email_address || email;
          telefono = customer.phone_number || telefono;

          if (customer.address) {
            direccion = Object.values(customer.address)
              .filter(Boolean)
              .join(", ");
          }
        }

      } catch (err) {
        console.error("❌ ERROR CUSTOMER API:", err);
      }
    }

    console.log("📦 PEDIDO FINAL:", {
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
            <p><a href="${squareOrderUrl}">Ver pedido en Square</a></p>
          `
        })
      });

      console.log("📩 TIENDA:", res.status);

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
          origen: "square",
          rgpd: "SI"
        })
      });

      console.log("📊 Sheets OK");

    } catch (err) {
      console.error("❌ ERROR SHEETS:", err);
    }

        console.log("📊 Sheets OK");

  } catch (err) {
    console.error("❌ ERROR SHEETS:", err);
  }

  return new Response("OK", { status: 200 });

} catch (err) {

  console.error("❌ ERROR WEBHOOK:", err);

  return new Response("Error", { status: 500 });

}

}

    
