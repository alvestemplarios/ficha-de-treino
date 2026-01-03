const json = (data, status=200) =>
  new Response(JSON.stringify(data), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

const nowIso = () => new Date().toISOString();

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, full_name, gender, birth_date, height_cm, weight_kg, goal_weight_kg, created_at, updated_at
     FROM users
     ORDER BY id DESC`
  ).all();

  return json({ users: results || [] });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(()=> null);
  if (!body) return json({ error:"JSON inválido." }, 400);

  const full_name = String(body.full_name || "").trim();
  const gender = String(body.gender || "").trim();
  const birth_date = String(body.birth_date || "").trim();

  if (!full_name || !gender || !birth_date) {
    return json({ error:"Campos obrigatórios: full_name, gender, birth_date." }, 400);
  }

  const height_cm = body.height_cm ?? null;
  const weight_kg = body.weight_kg ?? null;
  const goal_weight_kg = body.goal_weight_kg ?? null;

  const r = await env.DB.prepare(
    `INSERT INTO users (full_name, gender, birth_date, height_cm, weight_kg, goal_weight_kg, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(full_name, gender, birth_date, height_cm, weight_kg, goal_weight_kg, nowIso()).run();

  return json({ ok:true, user_id: r.meta?.last_row_id });
}
