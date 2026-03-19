export async function onRequestPost(context) {

  try {

    const body = await context.request.json();

    console.log("WEBHOOK RAW:", JSON.stringify(body, null, 2));

    const payment = body?.data?.object?.payment;

    if (!payment) {
      return new Response("No payment", { status: 200 });
    }

    if (payment.status !== "COMPLETED") {
      return new Response("Ignored", { status: 200 });
    }

    console.log("✅ PAGO COMPLETADO:", payment);

    return new Response("OK", { status: 200 });

  } catch (err) {

    console.error("ERROR WEBHOOK:", err);

    return new Response("Error", { status: 500 });

  }

}
