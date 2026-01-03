const json = (data, status=200) =>
  new Response(JSON.stringify(data), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

export async function onRequestGet({ env }) {
  try {
    await env.DB.prepare("SELECT 1 as ok").first();
    return json({ ok:true });
  } catch (e) {
    return json({ ok:false, error:String(e?.message || e) }, 500);
  }
}

