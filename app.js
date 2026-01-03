// app.js
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const API = {
  health: "/api/health",
  users: "/api/users",
  trainings: "/api/trainings",
  snapshot: "/api/snapshot",
  library: "/api/library"
};

const state = {
  users: [],
  trainings: [],
  selectedUserId: null,
  selectedTrainingId: null,
  charts: { progress: null, groups: null },
  libraryMerged: {} // builtin + D1
};

// BUILTIN vindo do exercise_library.js
const LIB_BUILTIN = window.EX_LIBRARY_BUILTIN || {};

// ---------------- helpers ----------------
function fmt1(n){ if (n==null || Number.isNaN(Number(n))) return "—"; return Number(n).toFixed(1); }
function fmt0(n){ if (n==null || Number.isNaN(Number(n))) return "—"; return Math.round(Number(n)).toString(); }
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function formatBRDate(iso){
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString("pt-BR");
}
function ageFromBirth(birth){
  if(!birth) return null;
  const d = new Date(birth);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
function bmi(heightCm, weightKg){
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const hm = h / 100;
  return w / (hm * hm);
}
function bmiClass(v){
  if (v==null) return "—";
  if (v < 18.5) return "Abaixo";
  if (v < 25) return "Normal";
  if (v < 30) return "Sobrepeso";
  if (v < 35) return "Obesidade I";
  if (v < 40) return "Obesidade II";
  return "Obesidade III";
}
function leftToGoal(weightKg, goalKg){
  const w = Number(weightKg);
  const g = Number(goalKg);
  if (!w || !g) return null;
  const left = w - g;
  return left <= 0 ? 0 : left;
}
function hrMax(age){ if (age==null) return null; return 220 - age; }

function parseReps(repsStr){
  const s = String(repsStr || "").trim().toLowerCase();
  if (!s) return null;
  if (s.includes("amrap") || s.includes("falha")) return null;
  const clean = s.replaceAll("até","-").replaceAll("a","-");
  let m = clean.match(/(\d+)\s*-\s*(\d+)/);
  if (m){
    const a = Number(m[1]), b = Number(m[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return (a+b)/2;
  }
  m = clean.match(/(\d+)/);
  if (m) return Number(m[1]);
  return null;
}
function exerciseVolume(e){
  const sets = Number(e.sets || 0);
  const reps = parseReps(e.reps);
  const w = Number(e.weight || 0);
  if (!sets || !reps || !w) return 0;
  return sets * reps * w;
}
function trainingTotals(t){
  const ex = (t?.exercises || []);
  let totalSets = 0;
  let totalVol = 0;
  for (const e of ex){
    totalSets += Number(e.sets || 0);
    totalVol += exerciseVolume(e);
  }
  const totalEx = ex.length;
  const avg = totalEx ? (totalVol / totalEx) : 0;
  return { totalEx, totalSets, totalVol, avgVol: avg };
}
function groupBy(arr, fn){
  const m = {};
  for (const it of (arr || [])){
    const k = fn(it);
    m[k] = m[k] || [];
    m[k].push(it);
  }
  return m;
}

function selectedUser(){ return state.users.find(u => u.id === state.selectedUserId) || null; }
function selectedTraining(){ return state.trainings.find(t => t.id === state.selectedTrainingId) || null; }
function userTrainings(){ if (!state.selectedUserId) return []; return state.trainings.filter(t => t.user_id === state.selectedUserId); }

function safeFile(s){
  return String(s||"usuario").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
}
function downloadFile(filename, text){
  const blob = new Blob([text], {type:"application/json;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ---------------- navegação ----------------
function setView(view){
  $$(".navBtn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${view}`));
  if (view === "dashboard") renderDashboard();
}

// ---------------- library merge ----------------
function mergeLibraries(builtinObj, dbItems){
  const merged = {};
  // builtin
  for (const [g, arr] of Object.entries(builtinObj || {})){
    merged[g] = merged[g] || new Set();
    for (const n of (arr || [])) merged[g].add(String(n).trim());
  }
  // db
  for (const it of (dbItems || [])){
    const g = String(it.muscle_group || "Outros").trim();
    const n = String(it.name || "").trim();
    if (!n) continue;
    merged[g] = merged[g] || new Set();
    merged[g].add(n);
  }
  // to arrays sorted
  const out = {};
  for (const [g, set] of Object.entries(merged)){
    out[g] = Array.from(set).sort((a,b)=> a.localeCompare(b, "pt-BR"));
  }
  return out;
}

async function loadLibrary(){
  let items = [];
  try{
    const r = await fetch(API.library);
    const data = await r.json();
    items = data.items || [];
  }catch{
    items = [];
  }
  state.libraryMerged = mergeLibraries(LIB_BUILTIN, items);
}

// ---------------- init ----------------
document.addEventListener("DOMContentLoaded", async () => {
  $$(".navBtn").forEach(btn => btn.addEventListener("click", () => setView(btn.dataset.view)));

  $("#btnAddUser").addEventListener("click", addUser);
  $("#btnClearUser").addEventListener("click", clearUserForm);

  $("#btnNewTraining").addEventListener("click", createTraining);
  $("#btnAddExercise").addEventListener("click", addExerciseLocal);
  $("#btnAddToLibrary").addEventListener("click", addToLibrary);

  $("#btnSaveTraining").addEventListener("click", saveTraining);
  $("#btnDeleteTraining").addEventListener("click", deleteTraining);
  $("#btnExportPdf").addEventListener("click", exportPdf);

  $("#btnBackup").addEventListener("click", doBackup);
  $("#fileRestore").addEventListener("change", doRestore);

  $("#ex_search").addEventListener("input", () => fillExerciseNames());

  await refreshHealth();

  await loadLibrary();
  initExerciseDropdowns();

  await reloadAll();
});

// ---------------- API load ----------------
async function refreshHealth(){
  try{
    const r = await fetch(API.health);
    $("#chipDb").textContent = r.ok ? "DB: OK" : "DB: ERRO";
    $("#chipDb").classList.toggle("ok", r.ok);
  }catch{
    $("#chipDb").textContent = "DB: ERRO";
    $("#chipDb").classList.remove("ok");
  }
}

async function reloadAll(){
  await loadUsers();
  await loadTrainings();
  renderUsersTable();
  renderSelectedSummary();
  renderTrainingsList();
  renderTrainingEditor();
  renderDashboard();
}

async function loadUsers(){
  const r = await fetch(API.users);
  const data = await r.json();
  state.users = (data.users || []).map(u => ({
    ...u,
    height_cm: u.height_cm == null ? null : Number(u.height_cm),
    weight_kg: u.weight_kg == null ? null : Number(u.weight_kg),
    goal_weight_kg: u.goal_weight_kg == null ? null : Number(u.goal_weight_kg),
  }));
}

async function loadTrainings(){
  const r = await fetch(API.trainings);
  const data = await r.json();
  state.trainings = (data.trainings || []).map(t => ({
    ...t,
    exercises: (t.exercises || []).map(e => ({
      ...e,
      sets: e.sets == null ? null : Number(e.sets),
      weight: e.weight == null ? null : Number(e.weight),
      sort_order: e.sort_order == null ? 0 : Number(e.sort_order)
    }))
  }));
}

// ---------------- USERS ----------------
function clearUserForm(){
  $("#u_name").value = "";
  $("#u_gender").value = "";
  $("#u_birth").value = "";
  $("#u_height").value = "";
  $("#u_weight").value = "";
  $("#u_goal").value = "";
}

async function addUser(){
  const payload = {
    full_name: $("#u_name").value.trim(),
    gender: $("#u_gender").value,
    birth_date: $("#u_birth").value,
    height_cm: $("#u_height").value ? Number($("#u_height").value) : null,
    weight_kg: $("#u_weight").value ? Number($("#u_weight").value) : null,
    goal_weight_kg: $("#u_goal").value ? Number($("#u_goal").value) : null
  };
  if (!payload.full_name || !payload.gender || !payload.birth_date){
    alert("Preencha: Nome, Sexo e Data de nascimento.");
    return;
  }
  const r = await fetch(API.users, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(payload)
  });
  const out = await r.json().catch(()=> ({}));
  if (!r.ok){
    alert(out.error || "Erro ao criar usuário.");
    return;
  }
  clearUserForm();
  await reloadAll();
}

function renderUsersTable(){
  const tbody = $("#usersBody");
  if (!state.users.length){
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Nenhum usuário cadastrado ainda.</td></tr>`;
    return;
  }

  tbody.innerHTML = state.users.map(u => {
    const age = ageFromBirth(u.birth_date);
    const b = bmi(u.height_cm, u.weight_kg);
    const cls = bmiClass(b);
    const left = leftToGoal(u.weight_kg, u.goal_weight_kg);
    const metaTxt = (u.goal_weight_kg ? `${fmt0(u.goal_weight_kg)} kg` : "—") +
      (left==null ? "" : (left===0 ? `<div class="muted">meta atingida</div>` : `<div class="muted">faltam ${fmt1(left)} kg</div>`));

    return `
      <tr>
        <td>
          <b>${escapeHtml(u.full_name)}</b>
          <div class="muted">${escapeHtml(u.gender)} • ${formatBRDate(u.birth_date)}</div>
        </td>
        <td>${age ?? "—"}</td>
        <td>${b==null ? "—" : `${fmt1(b)}<div class="muted">${escapeHtml(cls)}</div>`}</td>
        <td>${metaTxt}</td>
        <td>
          <button class="btn ${u.id===state.selectedUserId ? "primary": ""}" data-act="select" data-id="${u.id}">✅ Selecionar</button>
          <button class="btn danger" data-act="delete" data-id="${u.id}">🗑️ Excluir</button>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("button[data-act]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      const act = btn.dataset.act;

      if (act === "select"){
        state.selectedUserId = id;
        state.selectedTrainingId = null;
        $("#chipSelected").textContent = `Selecionado: ${selectedUser()?.full_name || "—"}`;
        renderUsersTable();
        renderSelectedSummary();
        renderTrainingsList();
        renderTrainingEditor();
        renderDashboard();
        return;
      }

      if (act === "delete"){
        if (!confirm("Excluir usuário e todos os dados dele?")) return;
        const r = await fetch(`${API.users}/${id}`, { method:"DELETE" });
        const out = await r.json().catch(()=> ({}));
        if (!r.ok){
          alert(out.error || "Erro ao excluir.");
          return;
        }
        if (state.selectedUserId === id){
          state.selectedUserId = null;
          state.selectedTrainingId = null;
          $("#chipSelected").textContent = "Nenhum usuário selecionado";
        }
        await reloadAll();
      }
    });
  });
}

function renderSelectedSummary(){
  const u = selectedUser();
  if (!u){
    $("#sum_bmi").textContent = "—";
    $("#sum_bmiClass").textContent = "—";
    $("#sum_left").textContent = "—";
    $("#sum_hrmax").textContent = "—";
    $("#sum_detail").textContent = "Selecione um usuário para ver os dados aqui.";
    return;
  }

  const age = ageFromBirth(u.birth_date);
  const b = bmi(u.height_cm, u.weight_kg);
  const cls = bmiClass(b);
  const left = leftToGoal(u.weight_kg, u.goal_weight_kg);
  const hr = hrMax(age);

  $("#sum_bmi").textContent = b==null ? "—" : fmt1(b);
  $("#sum_bmiClass").textContent = cls || "—";
  $("#sum_left").textContent = left==null ? "—" : (left===0 ? "Meta atingida" : `${fmt1(left)} kg`);
  $("#sum_hrmax").textContent = hr==null ? "—" : `${fmt0(hr)} bpm`;

  $("#sum_detail").innerHTML = `
    <div><b>${escapeHtml(u.full_name)}</b></div>
    <div class="muted">
      ${age ?? "—"} anos • ${escapeHtml(u.gender)} • Altura ${u.height_cm ? fmt0(u.height_cm) : "—"} cm
      • Peso ${u.weight_kg ? fmt1(u.weight_kg) : "—"} kg • Meta ${u.goal_weight_kg ? fmt1(u.goal_weight_kg) : "—"} kg
    </div>
  `;
}

// ---------------- TREINOS ----------------
async function createTraining(){
  const u = selectedUser();
  if (!u){ alert("Selecione um usuário primeiro."); return; }

  const title = prompt("Título do treino:", "Treino");
  if (title == null) return;

  const today = new Date().toISOString().slice(0,10);
  const training_date = prompt("Data (AAAA-MM-DD):", today);
  if (!training_date) return;

  const r = await fetch(API.trainings, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ user_id: u.id, title, training_date })
  });
  const out = await r.json().catch(()=> ({}));
  if (!r.ok){ alert(out.error || "Erro ao criar treino."); return; }

  await reloadAll();
  state.selectedTrainingId = out.training_id;
  renderTrainingsList();
  renderTrainingEditor();
}

function renderTrainingsList(){
  const box = $("#trainingsList");
  const u = selectedUser();
  if (!u){ box.innerHTML = `<div class="muted">Selecione um usuário.</div>`; return; }

  const list = userTrainings().slice().sort((a,b)=> (a.training_date < b.training_date ? 1 : -1));
  if (!list.length){ box.innerHTML = `<div class="muted">Nenhum treino cadastrado ainda.</div>`; return; }

  box.innerHTML = list.map(t => {
    const tot = trainingTotals(t);
    return `
      <div class="item">
        <div>
          <div class="title">${escapeHtml(t.title)}</div>
          <div class="sub">${formatBRDate(t.training_date)} • ${tot.totalEx} exercício(s) • séries ${fmt0(tot.totalSets)} • volume ${fmt0(tot.totalVol)} kg</div>
        </div>
        <div class="right">
          <button class="btn ${t.id===state.selectedTrainingId ? "primary": ""}" data-id="${t.id}">Editar</button>
        </div>
      </div>
    `;
  }).join("");

  box.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedTrainingId = Number(btn.dataset.id);
      renderTrainingsList();
      renderTrainingEditor();
    });
  });
}

function setTrainingTotalsUI(t){
  const set = (id,val) => { const el = $(id); if (el) el.textContent = val; };
  if (!t){ set("#t_totalExercises","—"); set("#t_totalSets","—"); set("#t_totalVolume","—"); set("#t_avgVolume","—"); return; }
  const tot = trainingTotals(t);
  set("#t_totalExercises", fmt0(tot.totalEx));
  set("#t_totalSets", fmt0(tot.totalSets));
  set("#t_totalVolume", fmt0(tot.totalVol));
  set("#t_avgVolume", fmt0(tot.avgVol));
}

function renderTrainingEditor(){
  const u = selectedUser();
  const t = selectedTraining();

  if (!u){
    $("#trainingHint").textContent = "Selecione um usuário.";
    $("#t_title").value = "";
    $("#t_date").value = "";
    $("#exercisesList").innerHTML = `<div class="muted">—</div>`;
    setTrainingTotalsUI(null);
    return;
  }

  if (!t || t.user_id !== u.id){
    $("#trainingHint").textContent = "Selecione um treino para editar.";
    $("#t_title").value = "";
    $("#t_date").value = "";
    $("#exercisesList").innerHTML = `<div class="muted">Nenhum treino selecionado.</div>`;
    setTrainingTotalsUI(null);
    return;
  }

  $("#trainingHint").textContent = "Edite, confira o volume e salve. (Volume = séries × reps × carga)";
  $("#t_title").value = t.title;
  $("#t_date").value = t.training_date;

  setTrainingTotalsUI(t);
  renderExercisesList();
}

// ---------- biblioteca UI ----------
function initExerciseDropdowns(){
  const g = $("#ex_group");
  const groups = Object.keys(state.libraryMerged || {}).sort((a,b)=> a.localeCompare(b,"pt-BR"));

  g.innerHTML = groups.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");
  g.addEventListener("change", () => {
    $("#ex_search").value = "";
    fillExerciseNames();
  });

  fillExerciseNames();
}

function fillExerciseNames(){
  const group = $("#ex_group").value;
  const sel = $("#ex_name");
  const q = ($("#ex_search").value || "").trim().toLowerCase();

  const list = (state.libraryMerged[group] || []);
  const filtered = q ? list.filter(n => n.toLowerCase().includes(q)) : list;

  sel.innerHTML = (filtered.length ? filtered : ["(nenhum encontrado)"])
    .map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`)
    .join("");
}

async function addToLibrary(){
  const muscle_group = $("#ex_group").value;
  const name = ($("#ex_custom").value || "").trim();

  if (!name){
    alert("Digite o nome do exercício em 'Novo exercício'.");
    return;
  }

  const r = await fetch(API.library, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ muscle_group, name })
  });

  const out = await r.json().catch(()=> ({}));
  if (!r.ok){
    alert(out.error || "Erro ao adicionar à biblioteca.");
    return;
  }

  $("#ex_custom").value = "";
  await loadLibrary();
  initExerciseDropdowns();

  // seleciona o exercício recém adicionado
  $("#ex_group").value = muscle_group;
  $("#ex_search").value = name;
  fillExerciseNames();
  $("#ex_search").value = "";
  alert("Adicionado à biblioteca!");
}

function addExerciseLocal(){
  const t = selectedTraining();
  if (!t){ alert("Selecione um treino."); return; }

  const muscle_group = $("#ex_group").value;
  const name = $("#ex_name").value;

  const sets = $("#ex_sets").value ? Number($("#ex_sets").value) : null;
  const reps = $("#ex_reps").value.trim();
  const weight = $("#ex_weight").value ? Number($("#ex_weight").value) : null;

  if (!muscle_group || !name || name === "(nenhum encontrado)"){
    alert("Selecione um exercício válido.");
    return;
  }

  const tempId = -(Date.now());
  t.exercises.push({
    id: tempId, training_id: t.id, muscle_group, name,
    sets, reps, weight, sort_order: t.exercises.length
  });

  $("#ex_sets").value = "";
  $("#ex_reps").value = "";
  $("#ex_weight").value = "";

  renderTrainingEditor();
}

function renderExercisesList(){
  const t = selectedTraining();
  if (!t){ $("#exercisesList").innerHTML = `<div class="muted">Selecione um treino.</div>`; return; }
  if (!t.exercises.length){ $("#exercisesList").innerHTML = `<div class="muted">Sem exercícios ainda.</div>`; return; }

  const groups = groupBy(t.exercises, e => e.muscle_group || "Outros");
  $("#exercisesList").innerHTML = Object.keys(groups).sort().map(group => {
    const items = groups[group].slice().sort((a,b)=> (a.sort_order??0)-(b.sort_order??0));
    const groupSets = items.reduce((acc,e)=> acc + Number(e.sets||0), 0);
    const groupVol = items.reduce((acc,e)=> acc + exerciseVolume(e), 0);

    return `
      <div class="item" style="flex-direction:column; align-items:stretch">
        <div class="title">📌 ${escapeHtml(group)}</div>
        <div class="sub">Séries: ${fmt0(groupSets)} • Volume: ${fmt0(groupVol)} kg</div>

        ${items.map((e) => {
          const vol = exerciseVolume(e);
          return `
            <div class="item" style="margin-top:8px">
              <div>
                <div class="title">${escapeHtml(e.name)}</div>
                <div class="sub">
                  ${e.sets ?? "—"} séries • reps: ${escapeHtml(e.reps || "—")} • carga: ${e.weight ?? "—"} kg
                  • <b>volume:</b> ${fmt0(vol)} kg
                </div>
              </div>
              <div class="right">
                <button class="btn danger" data-del="${e.id}">Remover</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }).join("");

  $("#exercisesList").querySelectorAll("button[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.del);
      const t = selectedTraining();
      if (!t) return;

      t.exercises = t.exercises.filter(e => e.id !== id).map((e,i)=> ({...e, sort_order:i}));
      renderTrainingEditor();
    });
  });
}

async function saveTraining(){
  const t = selectedTraining();
  if (!t){ alert("Selecione um treino."); return; }

  const title = $("#t_title").value.trim() || "Treino";
  const training_date = $("#t_date").value;
  if (!training_date){ alert("Informe a data."); return; }

  const exercises = t.exercises.map((e, i) => ({
    muscle_group: e.muscle_group,
    name: e.name,
    sets: e.sets,
    reps: e.reps,
    weight: e.weight,
    sort_order: i
  }));

  const r = await fetch(`${API.trainings}/${t.id}`, {
    method:"PUT",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify({ title, training_date, exercises })
  });

  const out = await r.json().catch(()=> ({}));
  if (!r.ok){ alert(out.error || "Erro ao salvar."); return; }

  await reloadAll();
  state.selectedTrainingId = t.id;
  alert("Treino salvo!");
}

async function deleteTraining(){
  const t = selectedTraining();
  if (!t){ alert("Selecione um treino."); return; }
  if (!confirm("Excluir este treino?")) return;

  const r = await fetch(`${API.trainings}/${t.id}`, { method:"DELETE" });
  const out = await r.json().catch(()=> ({}));
  if (!r.ok){ alert(out.error || "Erro ao excluir."); return; }

  state.selectedTrainingId = null;
  await reloadAll();
}

// ---------------- DASHBOARD ----------------
function renderDashboard(){
  const u = selectedUser();
  if (state.charts.progress){ state.charts.progress.destroy(); state.charts.progress = null; }
  if (state.charts.groups){ state.charts.groups.destroy(); state.charts.groups = null; }

  const ctxP = $("#chartProgress");
  const ctxG = $("#chartGroups");

  if (!u){
    state.charts.progress = new Chart(ctxP, { type:"bar", data:{ labels:["Selecione um usuário"], datasets:[{ label:"kg", data:[0] }]}, options:{ responsive:true } });
    state.charts.groups = new Chart(ctxG, { type:"doughnut", data:{ labels:["—"], datasets:[{ data:[1] }]}, options:{ responsive:true } });
    return;
  }

  const weight = Number(u.weight_kg || 0);
  const goal = Number(u.goal_weight_kg || 0);
  const left = leftToGoal(weight, goal);
  const leftVal = left==null ? 0 : left;

  state.charts.progress = new Chart(ctxP, {
    type:"bar",
    data:{ labels:["Peso atual", "Meta", "Faltam p/ meta"], datasets:[{ label:"kg", data:[weight || 0, goal || 0, leftVal || 0] }] },
    options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }
  });

  const trainings = userTrainings();
  const dist = {};
  for (const t of trainings){
    for (const e of (t.exercises || [])){
      const g = e.muscle_group || "Outros";
      const sets = Number(e.sets || 1);
      dist[g] = (dist[g] || 0) + (Number.isFinite(sets) ? sets : 1);
    }
  }
  const labels = Object.keys(dist);
  const values = labels.map(k => dist[k]);

  state.charts.groups = new Chart(ctxG, {
    type:"doughnut",
    data:{ labels, datasets:[{ data: values.length ? values : [1] }] },
    options:{ responsive:true }
  });
}

// ---------------- PDF (mantém o seu profissional) ----------------
async function exportPdf(){
  const u = selectedUser();
  if (!u){ alert("Selecione um usuário."); return; }

  await loadTrainings();
  const trainings = userTrainings().slice().sort((a,b)=> (a.training_date < b.training_date ? 1 : -1));
  if (!trainings.length){ alert("Este usuário não tem treinos."); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:"pt", format:"a4" });

  const age = ageFromBirth(u.birth_date);
  const b = bmi(u.height_cm, u.weight_kg);
  const cls = bmiClass(b);
  const left = leftToGoal(u.weight_kg, u.goal_weight_kg);
  const hr = hrMax(age);

  let totalUserVol = 0, totalUserSets = 0, totalUserEx = 0;
  for (const t of trainings){
    const tot = trainingTotals(t);
    totalUserVol += tot.totalVol;
    totalUserSets += tot.totalSets;
    totalUserEx += tot.totalEx;
  }

  doc.setFillColor(10, 18, 40);
  doc.rect(0, 0, 595, 86, "F");
  doc.setTextColor(255,255,255);
  doc.setFont("helvetica","bold");
  doc.setFontSize(18);
  doc.text("Ficha de Treino", 40, 44);
  doc.setFont("helvetica","normal");
  doc.setFontSize(10);
  doc.text("Relatório profissional • Usuário, indicadores e treinos", 40, 64);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 40, 80);

  doc.setTextColor(20,20,20);
  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text("Dados do Usuário", 40, 120);

  const userRows = [
    ["Nome completo", u.full_name],
    ["Sexo", u.gender],
    ["Data de nascimento", formatBRDate(u.birth_date)],
    ["Idade", age ?? "—"],
    ["Altura (cm)", u.height_cm ? fmt0(u.height_cm) : "—"],
    ["Peso atual (kg)", u.weight_kg ? fmt1(u.weight_kg) : "—"],
    ["Meta de peso (kg)", u.goal_weight_kg ? fmt1(u.goal_weight_kg) : "—"],
    ["IMC", b==null ? "—" : b.toFixed(1)],
    ["Classificação", cls],
    ["Faltam p/ meta", left==null ? "—" : (left===0 ? "Meta atingida" : `${left.toFixed(1)} kg`)],
    ["FC Máx (220-idade)", hr==null ? "—" : `${Math.round(hr)} bpm`],
    ["Total de treinos", String(trainings.length)],
    ["Total de exercícios", String(totalUserEx)],
    ["Séries totais (acumulado)", String(Math.round(totalUserSets))],
    ["Volume total (acumulado)", `${Math.round(totalUserVol)} kg`],
    ["Desenvolvedor", "Julio Cesar Alves"]
  ];

  doc.autoTable({
    startY: 132,
    head: [["Campo", "Valor"]],
    body: userRows,
    theme: "striped",
    styles: { font:"helvetica", fontSize:10, cellPadding:7 },
    headStyles: { fillColor:[10,18,40], textColor:[255,255,255] },
    alternateRowStyles: { fillColor:[245,248,255] },
    columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 355 } },
    margin: { left:40, right:40 }
  });

  let y = doc.lastAutoTable.finalY + 22;
  doc.setFont("helvetica","bold");
  doc.setFontSize(12);
  doc.text("Treinos (com volume por exercício e totais)", 40, y);
  y += 10;

  for (const t of trainings){
    const tot = trainingTotals(t);

    doc.setFont("helvetica","bold");
    doc.setFontSize(11);
    y += 16;
    if (y > 760){ doc.addPage(); y = 60; }
    doc.text(`${t.title} — ${formatBRDate(t.training_date)}`, 40, y);

    const rows = (t.exercises || [])
      .slice()
      .sort((a,b)=> (a.muscle_group.localeCompare(b.muscle_group) || (a.sort_order??0)-(b.sort_order??0)))
      .map(e => [e.muscle_group || "", e.name || "", e.sets ?? "", e.reps ?? "", e.weight ?? "", Math.round(exerciseVolume(e))]);

    doc.autoTable({
      startY: y + 10,
      head: [["Grupo","Exercício","Séries","Reps","Carga","Volume (kg)"]],
      body: rows,
      foot: [["TOTAL","",Math.round(tot.totalSets),"","",Math.round(tot.totalVol)]],
      theme: "grid",
      styles: { font:"helvetica", fontSize:9, cellPadding:6 },
      headStyles: { fillColor:[30,40,70], textColor:[255,255,255] },
      footStyles: { fillColor:[10,18,40], textColor:[255,255,255] },
      alternateRowStyles: { fillColor:[248,250,255] },
      margin: { left:40, right:40 }
    });

    y = doc.lastAutoTable.finalY + 14;
  }

  const pages = doc.getNumberOfPages();
  for (let p=1; p<=pages; p++){
    doc.setPage(p);
    doc.setFont("helvetica","normal");
    doc.setFontSize(9);
    doc.setTextColor(120,120,120);
    doc.text(`Página ${p} de ${pages}`, 520, 820);
  }

  doc.save(`ficha_treino_${safeFile(u.full_name)}.pdf`);
}

// ---------------- BACKUP/RESTORE ----------------
async function doBackup(){
  const log = $("#backupLog");
  log.textContent = "Exportando...\n";
  const r = await fetch(API.snapshot);
  const data = await r.json();
  log.textContent += "OK. Baixando arquivo...\n";
  downloadFile(`backup_ficha_treino_${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(data, null, 2));
  log.textContent += "Feito.\n";
}

async function doRestore(ev){
  const file = ev.target.files?.[0];
  if (!file) return;

  const log = $("#backupLog");
  log.textContent = "Lendo arquivo...\n";

  const text = await file.text();
  let data;
  try{ data = JSON.parse(text); }
  catch{ log.textContent += "JSON inválido.\n"; return; }

  if (!confirm("Restaurar este backup? Isso substitui TODOS os dados.")) return;

  log.textContent += "Enviando para o servidor...\n";
  const r = await fetch(API.snapshot, {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(data)
  });

  const out = await r.json().catch(()=> ({}));
  if (!r.ok){ log.textContent += `Erro: ${out.error || "falha"}\n`; return; }

  // recarrega inclusive biblioteca
  await loadLibrary();
  initExerciseDropdowns();

  log.textContent += "Restaurado! Recarregando...\n";
  await reloadAll();
  log.textContent += "OK.\n";
  ev.target.value = "";
}
