export async function onRequestPost(context) {
  console.log("🔥 FUNCTION /pago HIT");

  return new Response(JSON.stringify({
    ok: true
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
