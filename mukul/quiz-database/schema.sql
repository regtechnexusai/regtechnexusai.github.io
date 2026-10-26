-- MUKUL Agricultural Quiz Database — PostgreSQL foundation schema
-- Version 1.0 | 2026-10-26
-- Run in a disposable/staging database first. This script is additive and does not alter the website.
-- Requires PostgreSQL 13+ (gen_random_uuid() is built in on modern PostgreSQL).

BEGIN;

CREATE TABLE IF NOT EXISTS languages (
  language_code VARCHAR(10) PRIMARY KEY,
  language_name VARCHAR(80) NOT NULL,
  native_name VARCHAR(80) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO languages (language_code, language_name, native_name)
VALUES ('en', 'English', 'English'), ('bn', 'Bangla', 'বাংলা')
ON CONFLICT (language_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS topics (
  topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_topic_id UUID NULL REFERENCES topics(topic_id) ON DELETE RESTRICT,
  slug VARCHAR(120) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (parent_topic_id IS NULL OR parent_topic_id <> topic_id)
);

CREATE TABLE IF NOT EXISTS topic_translations (
  topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(language_code),
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  PRIMARY KEY (topic_id, language_code)
);

CREATE TABLE IF NOT EXISTS concepts (
  concept_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preferred_label_en VARCHAR(250) NOT NULL,
  scientific_name VARCHAR(250),
  external_vocabulary VARCHAR(80),
  external_concept_uri TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (external_vocabulary, external_concept_uri)
);

CREATE TABLE IF NOT EXISTS crops (
  crop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  scientific_name VARCHAR(250),
  family_name VARCHAR(150),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_translations (
  crop_id UUID NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(language_code),
  common_name VARCHAR(250) NOT NULL,
  PRIMARY KEY (crop_id, language_code, common_name)
);

CREATE TABLE IF NOT EXISTS sources (
  source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher VARCHAR(250) NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT,
  identifier TEXT,
  publication_date DATE,
  accessed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  source_type VARCHAR(40) NOT NULL DEFAULT 'web',
  license_name TEXT,
  reuse_permission_status VARCHAR(40) NOT NULL DEFAULT 'not_assessed'
    CHECK (reuse_permission_status IN ('not_assessed','open_license','permission_granted','public_domain','restricted','link_only','unknown')),
  source_language VARCHAR(10) REFERENCES languages(language_code),
  reliability_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_url IS NOT NULL OR identifier IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(topic_id) ON DELETE RESTRICT,
  question_type VARCHAR(30) NOT NULL
    CHECK (question_type IN ('single_choice','multiple_select','true_false')),
  difficulty VARCHAR(20) NOT NULL
    CHECK (difficulty IN ('basic','intermediate','advanced')),
  geographic_scope VARCHAR(20) NOT NULL DEFAULT 'global'
    CHECK (geographic_scope IN ('global','regional','country','local')),
  target_audiences TEXT[] NOT NULL DEFAULT ARRAY['general']::TEXT[],
  status VARCHAR(30) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','source_verified','subject_reviewed','language_qa','approved','published','rejected','retired')),
  risk_level VARCHAR(20) NOT NULL DEFAULT 'low'
    CHECK (risk_level IN ('low','medium','high')),
  created_by_role VARCHAR(40) NOT NULL DEFAULT 'content_author',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_from DATE,
  valid_to DATE,
  canonical_fingerprint CHAR(64),
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE INDEX IF NOT EXISTS idx_questions_topic_status ON questions(topic_id, status);
CREATE INDEX IF NOT EXISTS idx_questions_scope_difficulty ON questions(geographic_scope, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_fingerprint ON questions(canonical_fingerprint)
  WHERE canonical_fingerprint IS NOT NULL;

CREATE TABLE IF NOT EXISTS question_translations (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES languages(language_code),
  question_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  learning_objective TEXT,
  hint TEXT,
  reviewed_by_language_role BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, language_code),
  CHECK (length(trim(question_text)) > 0),
  CHECK (length(trim(explanation)) > 0)
);

CREATE TABLE IF NOT EXISTS question_options (
  option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  option_key VARCHAR(10) NOT NULL,
  option_text TEXT NOT NULL,
  option_order SMALLINT NOT NULL,
  FOREIGN KEY (question_id, language_code)
    REFERENCES question_translations(question_id, language_code) ON DELETE CASCADE,
  UNIQUE (question_id, language_code, option_key),
  UNIQUE (question_id, language_code, option_order),
  UNIQUE (option_id, question_id, language_code),
  CHECK (length(trim(option_text)) > 0)
);

CREATE TABLE IF NOT EXISTS correct_answers (
  correct_answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  option_id UUID NOT NULL,
  answer_explanation TEXT,
  FOREIGN KEY (option_id, question_id, language_code)
    REFERENCES question_options(option_id, question_id, language_code) ON DELETE CASCADE,
  UNIQUE (question_id, language_code, option_id)
);

CREATE TABLE IF NOT EXISTS question_regions (
  question_region_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  country_code CHAR(2),
  region_name VARCHAR(150),
  season_name VARCHAR(100),
  notes TEXT,
  valid_from DATE,
  valid_to DATE,
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

CREATE TABLE IF NOT EXISTS question_crops (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(crop_id) ON DELETE RESTRICT,
  relation_type VARCHAR(30) NOT NULL DEFAULT 'about'
    CHECK (relation_type IN ('about','example','comparison','host')),
  PRIMARY KEY (question_id, crop_id, relation_type)
);

CREATE TABLE IF NOT EXISTS question_sources (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(source_id) ON DELETE RESTRICT,
  evidence_note TEXT NOT NULL,
  supports_answer BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (question_id, source_id)
);

CREATE TABLE IF NOT EXISTS question_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  question_version INTEGER NOT NULL DEFAULT 1,
  reviewer_role VARCHAR(50) NOT NULL,
  review_type VARCHAR(40) NOT NULL
    CHECK (review_type IN ('source','subject_matter','language','safety','editorial','license')),
  decision VARCHAR(30) NOT NULL
    CHECK (decision IN ('approved','changes_requested','rejected','not_applicable')),
  rationale TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_reviews_question ON question_reviews(question_id, reviewed_at DESC);

CREATE TABLE IF NOT EXISTS question_versions (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  change_summary TEXT NOT NULL,
  changed_by_role VARCHAR(50) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snapshot JSONB NOT NULL,
  PRIMARY KEY (question_id, version_number)
);

CREATE TABLE IF NOT EXISTS question_tags (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  tag_slug VARCHAR(100) NOT NULL,
  PRIMARY KEY (question_id, tag_slug)
);

-- Public quiz attempt tables are intentionally out of scope for this foundation migration.
-- Add users/attempts only after the authentication, privacy, retention, and API design is approved.

COMMIT;
