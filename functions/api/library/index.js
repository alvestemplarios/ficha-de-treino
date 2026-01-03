const json = (data, status=200) =>
  new Response(JSON.stringify(data), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

const nowIso = () => new Date().toISOString();

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, muscle_group, name, created_at
     FROM exercise_library
     ORDER BY muscle_group ASC, name ASC`
  ).all();

  return json({ items: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(()=> null);
  if (!body) return json({ error:"JSON inválido." }, 400);

  const muscle_group = String(body.muscle_group || "").trim();
  const name = String(body.name || "").trim();

  if (!muscle_group || !name) return json({ error:"muscle_group e name são obrigatórios." }, 400);

  await env.DB.prepare(
    `INSERT INTO exercise_library (muscle_group, name, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(muscle_group, name) DO NOTHING`
  ).bind(muscle_group, name, nowIso()).run();

  return json({ ok:true });
}

