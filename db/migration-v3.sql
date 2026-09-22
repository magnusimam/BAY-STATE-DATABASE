-- HUMAID D1 Schema v3 — Normalize regional_overview for national scale
-- The v2 regional_overview table hardcoded one column per state (borno/adamawa/yobe/
-- bay_combined), which only works for exactly 3 states. This migration replaces it with a
-- long format — one row per (section, metric, state) — so any number of states can be synced
-- without further schema changes. Source of truth is the Google Sheet; this table is fully
-- rebuilt on every sync, so dropping and recreating it is safe (no data migration needed).

DROP TABLE IF EXISTS regional_overview;

CREATE TABLE regional_overview (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  section TEXT NOT NULL,        -- 'kpi' / 'zone_performance' / 'scorecard'
  metric  TEXT NOT NULL,
  state   TEXT NOT NULL,        -- state name, or 'National' for the all-Nigeria aggregate row
  y2022   REAL DEFAULT 0,
  y2023   REAL DEFAULT 0,
  y2024   REAL DEFAULT 0,
  y2025   REAL DEFAULT 0,
  trend   TEXT DEFAULT '',
  raw_row TEXT DEFAULT ''        -- full CSV row for flexible parsing
);

CREATE INDEX IF NOT EXISTS idx_regional_state   ON regional_overview(state);
CREATE INDEX IF NOT EXISTS idx_regional_section ON regional_overview(section);
CREATE INDEX IF NOT EXISTS idx_regional_metric  ON regional_overview(metric);
