-- HUMAID BAY States D1 Schema
-- Designed for scale: indexed on state, LGA, indicator for fast queries

-- ── State sheet data rows ───────────────────────────────────────────────────
-- One row per LGA × indicator (the core analytical data)
CREATE TABLE IF NOT EXISTS state_data (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  state     TEXT NOT NULL,            -- 'borno' | 'adamawa' | 'yobe'
  lga       TEXT NOT NULL,
  zone      TEXT NOT NULL,
  indicator TEXT NOT NULL,
  y2022     REAL NOT NULL DEFAULT 0,
  y2023     REAL NOT NULL DEFAULT 0,
  y2024     REAL NOT NULL DEFAULT 0,
  y2025     REAL NOT NULL DEFAULT 0,
  trend     TEXT NOT NULL DEFAULT '',
  synced_at INTEGER NOT NULL          -- epoch ms of last sync
);

CREATE INDEX IF NOT EXISTS idx_state_data_state      ON state_data(state);
CREATE INDEX IF NOT EXISTS idx_state_data_lga        ON state_data(state, lga);
CREATE INDEX IF NOT EXISTS idx_state_data_indicator  ON state_data(state, indicator);
CREATE INDEX IF NOT EXISTS idx_state_data_synced     ON state_data(synced_at);

-- ── Sync metadata ───────────────────────────────────────────────────────────
-- Tracks when each state was last synced (used for cache freshness)
CREATE TABLE IF NOT EXISTS sync_meta (
  state       TEXT PRIMARY KEY,
  last_synced INTEGER NOT NULL        -- epoch ms
);

-- ── Site content (admin-editable) ───────────────────────────────────────────
-- Stores the JSON blob that powers the landing page
CREATE TABLE IF NOT EXISTS site_content (
  id      TEXT PRIMARY KEY DEFAULT 'main',
  payload TEXT NOT NULL,              -- full JSON content
  updated_at INTEGER NOT NULL
);
