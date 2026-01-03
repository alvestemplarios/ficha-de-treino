PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  height_cm REAL,
  weight_kg REAL,
  goal_weight_kg REAL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS trainings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  training_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  training_id INTEGER NOT NULL,
  muscle_group TEXT NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  weight REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(training_id) REFERENCES trainings(id) ON DELETE CASCADE
);

-- NOVO: biblioteca custom (o builtin vem no JS; aqui salva o que você adicionar)
CREATE TABLE IF NOT EXISTS exercise_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  muscle_group TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(muscle_group, name)
);

CREATE INDEX IF NOT EXISTS idx_trainings_user_date ON trainings(user_id, training_date);
CREATE INDEX IF NOT EXISTS idx_exercises_training_order ON exercises(training_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_library_group ON exercise_library(muscle_group, name);
