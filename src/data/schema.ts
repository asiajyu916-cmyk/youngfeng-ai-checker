/**
 * 永豐 AI 法規檢核助手 V1.0
 * 資料庫結構定義（TypeScript 型別 + SQL DDL）
 *
 * 此檔案作為資料庫設計文件，供後端工程師建立實際資料庫使用。
 * 對應 SQL DDL 請見各型別下方的 SQL 註解。
 */

// ─────────────────────────────────────────────────────────────
// TABLE: plan_areas — 都市計畫區資料表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE plan_areas (
  id                    VARCHAR(50)   PRIMARY KEY,
  name                  VARCHAR(200)  NOT NULL,
  short_name            VARCHAR(50)   NOT NULL,
  description           TEXT,
  districts             JSONB         NOT NULL DEFAULT '[]',
  -- 都審設定
  ud_threshold_required  INT          NOT NULL DEFAULT 3000,  -- 強制送審面積（㎡），0=全部需送
  ud_threshold_review    INT          NOT NULL DEFAULT 1000,  -- 人工覆核面積（㎡）
  ud_is_independent      BOOLEAN      NOT NULL DEFAULT FALSE,
  ud_authority           VARCHAR(200),
  ud_note                TEXT,
  -- 容積獎勵設定
  far_committee_threshold DECIMAL(4,2) NOT NULL DEFAULT 1.30,
  far_max_total_bonus     DECIMAL(4,2) NOT NULL DEFAULT 1.50,
  far_note                TEXT,
  -- 其他
  applies_general_zoning  BOOLEAN     NOT NULL DEFAULT TRUE,
  special_rules           JSONB       NOT NULL DEFAULT '[]',
  rule_version            VARCHAR(20) NOT NULL DEFAULT 'V1.0',
  effective_date          DATE        NOT NULL,
  is_active               BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE plan_areas IS '都市計畫區資料表，儲存各都市計畫區之基本設定與管制規定';
COMMENT ON COLUMN plan_areas.ud_threshold_required IS '都市設計審議強制送審面積門檻（㎡），0代表全部需送審（如水湳）';
COMMENT ON COLUMN plan_areas.applies_general_zoning IS 'false代表有獨立分區管制（如水湳），不套用一般台中市分區管制';
*/
export interface PlanAreaRecord {
  id: string
  name: string
  short_name: string
  description: string
  districts: string[]
  ud_threshold_required: number
  ud_threshold_review: number
  ud_is_independent: boolean
  ud_authority: string
  ud_note?: string
  far_committee_threshold: number
  far_max_total_bonus: number
  far_note?: string
  applies_general_zoning: boolean
  special_rules: string[]
  rule_version: string
  effective_date: string
  is_active: boolean
}

// ─────────────────────────────────────────────────────────────
// TABLE: zoning_rules — 使用分區規則表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE zoning_rules (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_area_id          VARCHAR(50)  NOT NULL REFERENCES plan_areas(id),
  zone_type             VARCHAR(50)  NOT NULL,
  max_building_coverage DECIMAL(5,2) NOT NULL,  -- 建蔽率 %
  max_far               DECIMAL(7,2) NOT NULL,  -- 容積率 %
  max_height            DECIMAL(8,2),            -- 高度限制（m），NULL = 無限制
  notes                 TEXT,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (plan_area_id, zone_type)
);

COMMENT ON TABLE zoning_rules IS '各都市計畫區之使用分區管制規則（建蔽率、容積率、高度限制）';
*/
export interface ZoningRuleRecord {
  id: string
  plan_area_id: string
  zone_type: string
  max_building_coverage: number
  max_far: number
  max_height?: number
  notes?: string
  is_active: boolean
}

// ─────────────────────────────────────────────────────────────
// TABLE: special_zones — 特殊管制區資料表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE special_zones (
  id                    VARCHAR(50)  PRIMARY KEY,
  type                  VARCHAR(50)  NOT NULL,
  name                  VARCHAR(200) NOT NULL,
  description           TEXT,
  triggered_modules     JSONB        NOT NULL DEFAULT '[]',
  notes                 TEXT,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE special_zones IS '特殊管制區類型定義（都市設計管制區、水湳、山坡地等）';
*/
export interface SpecialZoneRecord {
  id: string
  type: string
  name: string
  description: string
  triggered_modules: string[]
  notes: string
  is_active: boolean
}

// ─────────────────────────────────────────────────────────────
// TABLE: district_rules — 行政區規則表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE district_rules (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  district              VARCHAR(50)  NOT NULL UNIQUE,
  default_plan_area_id  VARCHAR(50)  REFERENCES plan_areas(id),
  available_plan_areas  JSONB        NOT NULL DEFAULT '[]',  -- 可選都市計畫區清單
  notes                 TEXT,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE district_rules IS '行政區與都市計畫區之對應關係，一個行政區可能對應多個都市計畫區';
*/
export interface DistrictRuleRecord {
  id: string
  district: string
  default_plan_area_id?: string
  available_plan_areas: string[]
  notes?: string
}

// ─────────────────────────────────────────────────────────────
// TABLE: urban_design_thresholds — 都審門檻表（詳細版本）
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE urban_design_thresholds (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_area_id          VARCHAR(50)  NOT NULL REFERENCES plan_areas(id),
  zone_type             VARCHAR(50),             -- NULL = 適用該計畫區所有分區
  building_use          VARCHAR(100),            -- NULL = 適用所有用途
  threshold_sqm         INT          NOT NULL,   -- 面積門檻（㎡）
  threshold_type        VARCHAR(20)  NOT NULL,   -- 'required' | 'manual_review'
  condition_note        TEXT,
  effective_date        DATE         NOT NULL,
  expiry_date           DATE,
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE urban_design_thresholds IS '都市設計審議門檻細則，可依計畫區、分區、用途設定不同門檻';
*/
export interface UrbanDesignThresholdRecord {
  id: string
  plan_area_id: string
  zone_type?: string
  building_use?: string
  threshold_sqm: number
  threshold_type: 'required' | 'manual_review'
  condition_note?: string
  effective_date: string
  expiry_date?: string
  is_active: boolean
}

// ─────────────────────────────────────────────────────────────
// TABLE: cases — 案件資料表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE cases (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number           VARCHAR(50),
  case_name             VARCHAR(200) NOT NULL,
  architect_name        VARCHAR(100),
  handler_name          VARCHAR(100),
  -- 位置
  district              VARCHAR(50)  NOT NULL,
  plan_area_id          VARCHAR(50)  REFERENCES plan_areas(id),
  special_zone_ids      JSONB        NOT NULL DEFAULT '[]',
  -- 土地資料
  zone_type             VARCHAR(50),
  land_area_sqm         DECIMAL(12,2),
  -- 建築資料
  building_use          VARCHAR(100),
  building_ownership    VARCHAR(20)  CHECK (building_ownership IN ('public', 'private')),
  floors_above          INT,
  floors_below          INT,
  height_m              DECIMAL(8,2),
  total_floor_area      DECIMAL(12,2),
  residential_units     INT,
  -- 特殊條件
  is_hazard_rebuild     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_far_transfer       BOOLEAN      NOT NULL DEFAULT FALSE,
  is_open_space         BOOLEAN      NOT NULL DEFAULT FALSE,
  -- 後設資料
  status                VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);
*/
export interface CaseRecord {
  id: string
  case_number?: string
  case_name: string
  architect_name?: string
  handler_name?: string
  district: string
  plan_area_id?: string
  special_zone_ids: string[]
  zone_type?: string
  land_area_sqm?: number
  building_use?: string
  building_ownership: 'public' | 'private'
  floors_above?: number
  floors_below?: number
  height_m?: number
  total_floor_area?: number
  residential_units?: number
  is_hazard_rebuild: boolean
  is_far_transfer: boolean
  is_open_space: boolean
  status: 'draft' | 'checked' | 'confirmed' | 'archived'
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// TABLE: check_results — 檢核結果表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE check_results (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id               UUID         NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  module_code           VARCHAR(20)  NOT NULL,
  module_name           VARCHAR(200) NOT NULL,
  status                VARCHAR(20)  NOT NULL CHECK (status IN ('required','conditional','manual_review','not_required')),
  trigger_reason        TEXT,
  legal_basis           JSONB        NOT NULL DEFAULT '[]',
  priority_level        INT          NOT NULL DEFAULT 2,
  notes                 TEXT,
  ruleset_plan_area_id  VARCHAR(50)  REFERENCES plan_areas(id),
  ai_version            VARCHAR(20)  NOT NULL DEFAULT 'V1.0',
  is_overridden         BOOLEAN      NOT NULL DEFAULT FALSE,
  override_by           VARCHAR(100),
  override_reason       TEXT,
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW()
);
*/
export interface CheckResultRecord {
  id: string
  case_id: string
  module_code: string
  module_name: string
  status: 'required' | 'conditional' | 'manual_review' | 'not_required'
  trigger_reason?: string
  legal_basis: string[]
  priority_level: number
  notes?: string
  ruleset_plan_area_id?: string
  ai_version: string
  is_overridden: boolean
  override_by?: string
  override_reason?: string
  created_at: string
}

// ─────────────────────────────────────────────────────────────
// TABLE: regulation_versions — 法規版本表
// ─────────────────────────────────────────────────────────────
/*
CREATE TABLE regulation_versions (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code           VARCHAR(20)  NOT NULL,
  version_number        VARCHAR(20)  NOT NULL,
  version_note          TEXT,
  effective_date        DATE         NOT NULL,
  expiry_date           DATE,
  full_text             TEXT,
  attachment_url        VARCHAR(500),
  changed_by            VARCHAR(100),
  created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE (module_code, version_number)
);
*/
export interface RegulationVersionRecord {
  id: string
  module_code: string
  version_number: string
  version_note?: string
  effective_date: string
  expiry_date?: string
  full_text?: string
  attachment_url?: string
  changed_by?: string
  created_at: string
}
