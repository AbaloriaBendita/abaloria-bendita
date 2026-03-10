export async function onRequestPost(context) {

  const { request, env } = context;

  try {

    const formData = await request.formData();

    const nombre = formData.get("nombre") || "";
    const email = formData.get("email") || "";
    const telefono = formData.get("telefono") || "";
    const direccion = formData.get("direccion") || "";

    const cartRaw = formData.get("cart");

    if(!cartRaw){
      return new Response(JSON.stringify({error:"Carrito vacío"}),{status:400});
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

    /* =========================
       ENVÍO
    ========================= */

    let shipping = 0;

    if(total < 150){
      shipping = 8.5;
    }

    const finalTotal = total + shipping;

    /* =========================
       DESCRIPCIÓN PEDIDO
    ========================= */

    const items = cart.map(p => {

      const qty = p.qty || 1;

      return `${p.titulo} x${qty}`;

    }).join(", ");

    const description = `Pedido Abaloria Bendita: ${items}`;

    /* =========================
       SUMUP API
    ========================= */

    const res = await fetch("https://api.sumup.com/v0.1/checkouts", {

      method:"POST",

      headers:{
        "Authorization":`Bearer ${env.SUMUP_API_KEY}`,
        "Content-Type":"application/json"
      },

      body: JSON.stringify({

        checkout_reference: crypto.randomUUID(),

        amount: finalTotal.toFixed(2),

        currency: "EUR",

        description,

        merchant_code: env.SUMUP_MERCHANT,

      })

    });

    const data = await res.json();

    if(!data.checkout_url){

      console.error(data);

      return new Response(JSON.stringify({error:"SumUp error"}),{status:500});

    }

    /* =========================
       RESPUESTA
    ========================= */

    return new Response(JSON.stringify({

      payment_url: data.checkout_url

    }),{

      headers:{
        "Content-Type":"application/json"
      }

    });

  } catch(err){

    console.error(err);

    return new Response(JSON.stringify({error:"Server error"}),{status:500});

  }

}
