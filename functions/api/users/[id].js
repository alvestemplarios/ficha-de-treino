const json = (data, status=200) =>
  new Response(JSON.stringify(data), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

export async function onRequestDelete({ params, env }) {
  const id = Number(params.id);
  if (!id) return json({ error:"ID inválido." }, 400);

  // apaga em ordem (por segurança)
  await env.DB.prepare(
    `DELETE FROM exercises WHERE training_id IN (SELECT id FROM trainings WHERE user_id = ?)`
  ).bind(id).run();

  await env.DB.prepare(`DELETE FROM trainings WHERE user_id = ?`).bind(id).run();
  await env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(id).run();

  return json({ ok:true });
}
