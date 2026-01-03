// exercise_library.js
// Biblioteca BR + máquinas + sinônimos + variações de pegada (pronada/supinada/neutra).
// Dica: o app faz merge com a biblioteca do banco (D1) e remove duplicados via Set.

window.EX_LIBRARY_BUILTIN = {
  // =========================
  // PEITO
  // =========================
  "Peito": [
    // Supinos / Press
    "Supino reto (barra)","Supino reto (halteres)","Supino reto (máquina)","Supino reto (Smith)",
    "Supino inclinado (barra)","Supino inclinado (halteres)","Supino inclinado (máquina)","Supino inclinado (Smith)",
    "Supino declinado (barra)","Supino declinado (halteres)","Supino declinado (máquina)","Supino declinado (Smith)",
    "Supino fechado (barra)","Supino fechado (Smith)","Supino com pausa (barra)","Supino pegada aberta (barra)",
    "Chest press (máquina)","Chest press (convergente)","Press convergente (máquina)","Press articulado (máquina)",
    "Press reto na máquina","Press inclinado na máquina",

    // Fly / Voador / Crossover
    "Crucifixo reto (halteres)","Crucifixo inclinado (halteres)","Crucifixo declinado (halteres)",
    "Crucifixo na polia (cabo)","Crucifixo na polia (unilateral)",
    "Peck-deck","Peck deck","Voador (máquina)","Crucifixo na máquina (voador)",
    "Crossover (polia)","Cross over (polia)","Crossover alto","Crossover médio","Crossover baixo",
    "Crossover unilateral","Crossover ajoelhado",
    "Fly na polia","Fly no cabo",

    // Flexões / extras
    "Flexão de braço","Flexão inclinada","Flexão declinada","Flexão diamante","Flexão com elástico",
    "Pullover (halter)","Pullover (polia)","Pullover (máquina)","Squeeze press (halteres)"
  ],

  "Peito — Máquinas": [
    "Chest press (máquina)","Chest press inclinado","Chest press declinado",
    "Press convergente (máquina)","Press articulado (máquina)",
    "Voador (máquina)","Peck-deck","Crucifixo na máquina (voador)",
    "Supino na máquina","Supino (Hammer Strength)","Press máquina (reta)","Press máquina (inclinado)"
  ],

  // =========================
  // COSTAS
  // =========================
  "Costas": [
    // Barra fixa (pegadas)
    "Barra fixa (pronada)","Barra fixa (supinada)","Barra fixa (neutra)",
    "Barra fixa assistida (pronada)","Barra fixa assistida (supinada)","Barra fixa assistida (neutra)",
    "Chin-up (barra fixa supinada)","Pull-up (barra fixa pronada)",

    // Puxadas (puxador / lat pulldown)
    "Puxada frontal (puxador)","Puxada na polia (puxador)","Puxada alta (puxador)",
    "Puxada aberta (pronada)","Puxada supinada (fechada)","Puxada neutra (triângulo)",
    "Puxada triângulo (neutra)","Puxada pegada paralela (neutra)",
    "Puxada na barra (puxador)","Puxada unilateral (puxador)",
    "Pulldown (puxador)","Lat pulldown (puxador)",
    "Pulldown braço reto (corda)","Pulldown braço reto (barra)",
    "Puxada atrás (puxador)",

    // Remadas (inclui nomes BR)
    "Remada curvada (barra)","Remada curvada (pegada pronada)","Remada curvada (pegada supinada)",
    "Remada unilateral (halter)","Remada serrote (halter)","Serrote (halter)","Remada serrote",
    "Remada cavalinho (T-bar)","Cavalinho (T-bar)","Remada T-bar","Remada barra T",
    "Remada baixa (polia)","Remada baixa (triângulo)","Remada baixa (pegada neutra)",
    "Remada sentada (máquina)","Remada na máquina","Remada articulada (máquina)",
    "Remada no Smith","Remada no banco inclinado (halteres)","Remada peito apoiado (máquina)",

    // Lombar / posterior / extras
    "Levantamento terra","Terra romeno","Rack pull (terra parcial)",
    "Hiperextensão lombar","Elevação de tronco","Good morning (barra)",
    "Pullover (halter)","Pullover (polia)","Pullover (máquina)",
    "Face pull (corda)"
  ],

  "Costas — Puxadas (Puxador)": [
    "Puxada aberta (pronada)","Puxada aberta (puxador)","Puxada frontal (puxador)",
    "Puxada supinada (puxador)","Puxada fechada supinada","Puxada neutra (triângulo)",
    "Puxada triângulo (neutra)","Puxada paralela (neutra)",
    "Pulldown (puxador)","Lat pulldown (puxador)",
    "Pulldown braço reto (corda)","Pulldown braço reto (barra)",
    "Puxada unilateral (puxador)","Puxada na máquina (costas)"
  ],

  "Costas — Remadas": [
    "Remada curvada (barra)","Remada curvada supinada","Remada curvada pronada",
    "Remada serrote (halter)","Remada unilateral (halter)","Serrote (halter)",
    "Remada cavalinho (T-bar)","Cavalinho (T-bar)","Remada T-bar",
    "Remada baixa (polia)","Remada baixa (triângulo)","Remada baixa (neutra)",
    "Remada na máquina","Remada articulada (máquina)","Remada sentada (máquina)",
    "Remada no banco inclinado (halteres)","Remada peito apoiado (máquina)"
  ],

  // =========================
  // OMBROS / DELTOIDES
  // =========================
  "Ombros": [
    // Desenvolvimento
    "Desenvolvimento militar (barra)","Desenvolvimento militar sentado (barra)",
    "Desenvolvimento (halteres)","Arnold press","Desenvolvimento no Smith",
    "Desenvolvimento na máquina","Press militar (máquina)",

    // Laterais / frontais / posteriores
    "Elevação lateral (halteres)","Elevação lateral sentado","Elevação lateral na polia",
    "Elevação lateral na máquina","Elevação lateral inclinada",
    "Elevação frontal (halteres)","Elevação frontal (barra)","Elevação frontal na polia",
    "Crucifixo inverso (halteres)","Crucifixo inverso na máquina","Reverse peck-deck","Voador invertido",
    "Elevação posterior (halteres)","Elevação posterior na polia",

    // Trapézio / combos
    "Remada alta (barra)","Remada alta (polia)","Face pull (corda)",
    "Encolhimento (barra)","Encolhimento (halteres)","Encolhimento no Smith",

    // Manguito / técnica
    "Rotação externa (cabo)","Rotação externa (halter)","Rotação interna (cabo)",
    "Cuban press","Landmine press"
  ],

  "Ombros — Máquinas": [
    "Desenvolvimento na máquina","Press militar (máquina)","Elevação lateral na máquina",
    "Reverse peck-deck","Voador invertido","Remada alta na máquina"
  ],

  // =========================
  // BÍCEPS (com pegadas)
  // =========================
  "Bíceps": [
    "Rosca direta (barra)","Rosca direta (barra W)","Rosca direta no Smith",
    "Rosca alternada (halteres)","Rosca simultânea (halteres)",
    "Rosca martelo","Rosca martelo cruzada","Rosca martelo na polia (corda)",
    "Rosca inclinada (halteres)",
    "Rosca Scott (barra W)","Rosca Scott (máquina)","Rosca Scott unilateral",
    "Rosca concentrada",
    "Rosca 21",
    "Rosca na polia (barra)","Rosca na polia (corda)","Rosca na polia unilateral",
    "Rosca spider (halteres)",
    "Rosca inversa (barra)","Rosca inversa (barra W)","Rosca inversa (halteres)",
    "Rosca Zottman",
    "Chin-up (barra fixa supinada)"
  ],

  "Bíceps — Pegadas/Sinônimos": [
    "Rosca direta (supinada)","Rosca direta (pegada supinada)",
    "Rosca inversa (pronada)","Rosca inversa (pegada pronada)",
    "Rosca martelo (neutra)","Rosca martelo (pegada neutra)",
    "Barra fixa (supinada)","Chin-up (supinada)"
  ],

  // =========================
  // TRÍCEPS
  // =========================
  "Tríceps": [
    "Tríceps pulley (barra)","Tríceps pulley (corda)","Tríceps pulley unilateral",
    "Tríceps testa (barra)","Tríceps testa (barra W)","Tríceps testa (halteres)",
    "Tríceps francês (halter)","Tríceps francês (barra W)","Tríceps francês (polia)",
    "Extensão acima da cabeça (corda)","Extensão acima da cabeça (halter)",
    "Coice (halter)","Coice (polia)",
    "Mergulho no banco","Mergulho nas paralelas",
    "Supino fechado","JM press"
  ],

  "Tríceps — Polia": [
    "Tríceps pulley (barra)","Tríceps pulley (corda)","Tríceps pulley unilateral",
    "Tríceps na polia pegada reversa","Pressdown V-bar","Pressdown barra reta",
    "Extensão acima da cabeça (corda)","Tríceps francês (polia)","Coice (polia)"
  ],

  // =========================
  // PERNAS (subdividido)
  // =========================
  "Quadríceps": [
    "Agachamento livre","Agachamento frontal","Agachamento no Smith","Agachamento hack","Hack (máquina)",
    "Leg press 45°","Leg press horizontal","Leg press unilateral",
    "Cadeira extensora","Extensora unilateral",
    "Passada (afundo) com halteres","Passada no Smith","Passada andando",
    "Agachamento búlgaro","Step-up (caixa)","Sissy squat"
  ],

  "Posterior de Coxa": [
    "Stiff (barra)","Stiff (halteres)","Terra romeno",
    "Mesa flexora","Mesa flexora unilateral","Cadeira flexora","Cadeira flexora unilateral",
    "Nordic curl","Glute ham raise (GHR)","Pull-through (polia)","Good morning (barra)"
  ],

  "Glúteos": [
    "Hip thrust","Hip thrust no Smith","Elevação pélvica","Ponte de glúteo",
    "Coice (polia)","Coice (máquina)",
    "Abdução (máquina)","Abdução (polia)",
    "Agachamento sumô","Terra sumô",
    "Passada longa (ênfase glúteo)","Step-up (ênfase glúteo)"
  ],

  "Panturrilha": [
    "Panturrilha em pé","Panturrilha em pé (máquina)","Panturrilha sentado",
    "Panturrilha no leg press","Panturrilha unilateral","Panturrilha no Smith",
    "Panturrilha na escada","Panturrilha donkey"
  ],

  "Pernas — Máquinas": [
    "Leg press 45°","Leg press horizontal","Hack (máquina)","Agachamento hack","Cadeira extensora",
    "Mesa flexora","Cadeira flexora","Cadeira adutora","Cadeira abdutora","Glute drive (máquina)",
    "Panturrilha em pé (máquina)","Panturrilha sentado (máquina)"
  ],

  // =========================
  // CORE / ABD / LOMBAR
  // =========================
  "Abdômen/Core": [
    "Prancha","Prancha lateral","Abdominal supra","Abdominal infra",
    "Elevação de pernas (barra)","Elevação de joelhos (barra)",
    "Abdominal na polia (cable crunch)","Crunch máquina","Crunch com peso",
    "Russian twist","Dead bug","Hollow hold","Mountain climber",
    "Ab wheel (rodinha)","Sit-up","V-up","Bicicleta (abdominal)",
    "Pallof press","Woodchopper (cabo)"
  ],

  "Lombar": [
    "Hiperextensão lombar","Elevação de tronco","Back extension (máquina)",
    "Good morning (barra)","Terra","Rack pull","Superman","Bird-dog"
  ],

  // =========================
  // ANTEBRAÇO / PEGADA
  // =========================
  "Antebraço/Grip": [
    "Rosca punho (barra)","Rosca punho (halteres)","Rosca punho inversa",
    "Farmer walk","Dead hang (barra)","Pinch grip (anilhas)","Hand gripper",
    "Extensão de punho (cabo)","Desvio ulnar/radial (halter)"
  ],

  // =========================
  // CARDIO
  // =========================
  "Cardio/Condicionamento": [
    "Caminhada (esteira)","Corrida (esteira)","Bike (ergométrica)","Elíptico",
    "Escada (stair climber)","Remo (ergômetro)","HIIT (intervalado)",
    "Assault bike","Pular corda","Circuito funcional"
  ],

  // =========================
  // “NOMES DA ACADEMIA” (atalho)
  // =========================
  "Atalhos BR (nomes comuns)": [
    "Puxador (puxada alta)","Puxador (puxada frontal)","Triângulo (puxada neutra)",
    "Voador (peito)","Voador invertido (posterior)","Cavalinho (remada T-bar)",
    "Serrote (remada unilateral)","Hack (agachamento hack)","Extensora (cadeira extensora)",
    "Flexora (mesa/cadeira flexora)","Abdutora","Adutora","Smith (supino/agacho)",
    "Cross over (crossover)","Pulley tríceps","Pulley costas","Rosca na polia"
  ]
};
