export async function onRequestPost(context) {

  const body = await context.request.json();

  console.log("WEBHOOK RAW:", JSON.stringify(body, null, 2));

  return new Response("OK");
}
