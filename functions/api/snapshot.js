const json = (data, status=200) =>
  new Response(JSON.stringify(data, null, 2), { status, headers:{ "content-type":"application/json; charset=utf-8" } });

const nowIso = () => new Date().toISOString();

export async function onRequestGet({ env }) {
  const users = (await env.DB.prepare(`SELECT * FROM users ORDER BY id ASC`).all()).results || [];
  const trainings = (await env.DB.prepare(`SELECT * FROM trainings ORDER BY id ASC`).all()).results || [];
  const exercises = (await env.DB.prepare(`SELECT * FROM exercises ORDER BY id ASC`).all()).results || [];
  const library = (await env.DB.prepare(`SELECT * FROM exercise_library ORDER BY id ASC`).all()).results || [];

  return json({
    version: 2,
    exported_at: nowIso(),
    users,
    trainings,
    exercises,
    library
  });
}

export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(()=> null);
  if (!body) return json({ error:"JSON inválido." }, 400);

  const users = Array.isArray(body.users) ? body.users : [];
  const trainings = Array.isArray(body.trainings) ? body.trainings : [];
  const exercises = Array.isArray(body.exercises) ? body.exercises : [];
  const library = Array.isArray(body.library) ? body.library : [];

  await env.DB.exec("BEGIN");
  try {
    await env.DB.exec("DELETE FROM exercises");
    await env.DB.exec("DELETE FROM trainings");
    await env.DB.exec("DELETE FROM users");
    await env.DB.exec("DELETE FROM exercise_library");

    for (const u of users) {
      await env.DB.prepare(
        `INSERT INTO users (id, full_name, gender, birth_date, height_cm, weight_kg, goal_weight_kg, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        u.id ?? null,
        u.full_name ?? "",
        u.gender ?? "",
        u.birth_date ?? "",
        u.height_cm ?? null,
        u.weight_kg ?? null,
        u.goal_weight_kg ?? null,
        u.created_at ?? nowIso(),
        u.updated_at ?? null
      ).run();
    }

    for (const t of trainings) {
      await env.DB.prepare(
        `INSERT INTO trainings (id, user_id, title, training_date, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
        t.id ?? null,
        t.user_id ?? null,
        t.title ?? "Treino",
        t.training_date ?? "",
        t.created_at ?? nowIso(),
        t.updated_at ?? null
      ).run();
    }

    for (const e of exercises) {
      await env.DB.prepare(
        `INSERT INTO exercises (id, training_id, muscle_group, name, sets, reps, weight, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        e.id ?? null,
        e.training_id ?? null,
        e.muscle_group ?? "Outros",
        e.name ?? "Exercício",
        e.sets ?? null,
        e.reps ?? "",
        e.weight ?? null,
        e.sort_order ?? 0
      ).run();
    }

    for (const x of library) {
      await env.DB.prepare(
        `INSERT INTO exercise_library (id, muscle_group, name, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(muscle_group, name) DO NOTHING`
      ).bind(
        x.id ?? null,
        x.muscle_group ?? "",
        x.name ?? "",
        x.created_at ?? nowIso()
      ).run();
    }

    await env.DB.exec("COMMIT");
    return json({ ok:true, restored:{ users:users.length, trainings:trainings.length, exercises:exercises.length, library:library.length } });
  } catch (err) {
    try { await env.DB.exec("ROLLBACK"); } catch {}
    return json({ error:String(err?.message || err) }, 500);
  }
}
