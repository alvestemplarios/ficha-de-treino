const json = (data, status=200) =>
  new Response(JSON.stringify(data), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

export async function onRequestDelete({ params, env }) {
  const id = Number(params.id);
  if (!id) return json({ error:"ID inválido." }, 400);

  await env.DB.prepare(`DELETE FROM exercise_library WHERE id = ?`).bind(id).run();
  return json({ ok:true });
}
