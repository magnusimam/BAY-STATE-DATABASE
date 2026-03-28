-- HUMAID BAY States D1 Schema v2 — Unified Database Migration
-- Migrates from per-state tables to unified schema matching the
-- BAY Sub-Regional Youth Peace & Security Tracker (6 tabs, 65 LGAs, 10 indicators)

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. MASTER_DATA — Core dataset (650 rows: 65 LGAs × 10 indicators)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS master_data (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  state      TEXT NOT NULL,            -- Borno / Adamawa / Yobe
  lga        TEXT NOT NULL,
  risk_zone  TEXT NOT NULL,            -- High Risk / Medium Risk / Low Risk
  indicator  TEXT NOT NULL,
  y2022      REAL NOT NULL DEFAULT 0,
  y2023      REAL NOT NULL DEFAULT 0,
  y2024      REAL NOT NULL DEFAULT 0,
  y2025      REAL NOT NULL DEFAULT 0,
  change_pct REAL DEFAULT 0,           -- (2025-2022)/2022 × 100
  trend      TEXT NOT NULL DEFAULT '', -- Improving / Stable / Declining
  sources    TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_master_state     ON master_data(state);
CREATE INDEX IF NOT EXISTS idx_master_lga       ON master_data(state, lga);
CREATE INDEX IF NOT EXISTS idx_master_indicator ON master_data(indicator);
CREATE INDEX IF NOT EXISTS idx_master_zone      ON master_data(risk_zone);
CREATE INDEX IF NOT EXISTS idx_master_state_ind ON master_data(state, indicator);

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. REGIONAL_OVERVIEW — KPIs, zone performance, progress scorecards (~40 rows)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS regional_overview (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  section      TEXT NOT NULL,          -- 'kpi' / 'zone_performance' / 'scorecard'
  metric       TEXT NOT NULL,
  borno        REAL DEFAULT 0,
  adamawa      REAL DEFAULT 0,
  yobe         REAL DEFAULT 0,
  bay_combined REAL DEFAULT 0,
  bay_2022     REAL DEFAULT 0,
  bay_2023     REAL DEFAULT 0,
  bay_2024     REAL DEFAULT 0,
  bay_2025     REAL DEFAULT 0,
  trend        TEXT DEFAULT '',
  raw_row      TEXT DEFAULT ''         -- full CSV row for flexible parsing
);

CREATE INDEX IF NOT EXISTS idx_regional_section ON regional_overview(section);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. LGA_PROFILES — Wide-format 2025 snapshot (~71 rows)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lga_profiles (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  state               TEXT NOT NULL,
  lga                 TEXT NOT NULL,
  risk_zone           TEXT NOT NULL,
  youth_pct           REAL DEFAULT 0,
  literacy_pct        REAL DEFAULT 0,
  unemployment_pct    REAL DEFAULT 0,
  health_facilities   REAL DEFAULT 0,
  ag_output           REAL DEFAULT 0,
  displacement        REAL DEFAULT 0,
  conflict_incidents  REAL DEFAULT 0,
  smes                REAL DEFAULT 0,
  out_of_school_gap   REAL DEFAULT 0,
  voter_gap           REAL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_profiles_state ON lga_profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_zone  ON lga_profiles(risk_zone);

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. TREND_ANALYSIS — Narrative insights and progress summaries (~54 rows)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trend_analysis (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  section  TEXT NOT NULL,              -- 'progress' / 'zone_comparison' / 'insights'
  state    TEXT DEFAULT '',            -- state name or empty for BAY-wide
  metric   TEXT DEFAULT '',
  content  TEXT NOT NULL,              -- raw CSV row or narrative text
  raw_row  TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_trend_section ON trend_analysis(section);
CREATE INDEX IF NOT EXISTS idx_trend_state   ON trend_analysis(state);

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. INDICATOR_ANALYSIS — Per-indicator deep dives with rankings (~266 rows)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS indicator_analysis (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator   TEXT NOT NULL,
  state       TEXT NOT NULL,
  lga         TEXT NOT NULL,
  risk_zone   TEXT DEFAULT '',
  y2022       REAL DEFAULT 0,
  y2023       REAL DEFAULT 0,
  y2024       REAL DEFAULT 0,
  y2025       REAL DEFAULT 0,
  change_pct  REAL DEFAULT 0,          -- 4-year change %
  rank        INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_indanalysis_indicator ON indicator_analysis(indicator);
CREATE INDEX IF NOT EXISTS idx_indanalysis_state     ON indicator_analysis(state);

-- ══════════════════════════════════════════════════════════════════════════════
-- 6. METHODOLOGY — Definitions, sources, aggregation rules (~41 rows)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS methodology (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  key     TEXT NOT NULL,
  value   TEXT NOT NULL
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. SYNC_META — Upgraded to track all tabs, not just per-state
-- ══════════════════════════════════════════════════════════════════════════════
-- Drop old sync_meta if it exists (was keyed by state only)
DROP TABLE IF EXISTS sync_meta;

CREATE TABLE IF NOT EXISTS sync_meta (
  key         TEXT PRIMARY KEY,        -- 'master_data' / 'regional_overview' / 'last_full_sync' etc.
  value       TEXT NOT NULL,           -- JSON or simple value
  updated_at  INTEGER NOT NULL         -- epoch ms
);

-- ══════════════════════════════════════════════════════════════════════════════
-- Keep existing tables for backwards compatibility during migration
-- site_content table remains unchanged
-- state_data table will be dropped after frontend is fully rewired
-- ══════════════════════════════════════════════════════════════════════════════
