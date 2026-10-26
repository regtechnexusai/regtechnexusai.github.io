-- MUKUL Agricultural Quiz Database — PostgreSQL foundation schema
-- Version 1.1 | 2026-10-26
-- Additive foundation only; does not alter website files.
-- Requires PostgreSQL 13+. Run in a disposable/staging database first.

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
  PRIMARY KEY (topic_id, language_code),
  CHECK (length(trim(display_name)) > 0)
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
  PRIMARY KEY (crop_id, language_code, common_name),
  CHECK (length(trim(common_name)) > 0)
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
  CHECK (source_url IS NOT NULL OR identifier IS NOT NULL),
  CHECK (length(trim(publisher)) > 0 AND length(trim(title)) > 0)
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
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from),
  CHECK (cardinality(target_audiences) > 0)
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
  CHECK (length(trim(option_text)) > 0),
  CHECK (option_order > 0)
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
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from),
  CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
);

CREATE TABLE IF NOT EXISTS question_crops (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(crop_id) ON DELETE RESTRICT,
  relation_type VARCHAR(30) NOT NULL DEFAULT 'about'
    CHECK (relation_type IN ('about','example','comparison','host')),
  PRIMARY KEY (question_id, crop_id, relation_type)
);

CREATE TABLE IF NOT EXISTS question_concepts (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  concept_id UUID NOT NULL REFERENCES concepts(concept_id) ON DELETE RESTRICT,
  relation_type VARCHAR(30) NOT NULL DEFAULT 'about'
    CHECK (relation_type IN ('about','example','method','organism','symptom')),
  PRIMARY KEY (question_id, concept_id, relation_type)
);

CREATE TABLE IF NOT EXISTS question_sources (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(source_id) ON DELETE RESTRICT,
  evidence_note TEXT NOT NULL,
  supports_answer BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (question_id, source_id),
  CHECK (length(trim(evidence_note)) > 0)
);

CREATE TABLE IF NOT EXISTS question_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  question_version INTEGER NOT NULL DEFAULT 1 CHECK (question_version > 0),
  reviewer_role VARCHAR(50) NOT NULL,
  reviewer_reference VARCHAR(160),
  review_type VARCHAR(40) NOT NULL
    CHECK (review_type IN ('source','subject_matter','language','safety','editorial','license')),
  decision VARCHAR(30) NOT NULL
    CHECK (decision IN ('approved','changes_requested','rejected','not_applicable')),
  rationale TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (length(trim(reviewer_role)) > 0 AND length(trim(rationale)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_question_reviews_question ON question_reviews(question_id, reviewed_at DESC);

CREATE TABLE IF NOT EXISTS question_versions (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  change_summary TEXT NOT NULL,
  changed_by_role VARCHAR(50) NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  snapshot JSONB NOT NULL,
  PRIMARY KEY (question_id, version_number)
);

CREATE TABLE IF NOT EXISTS question_tags (
  question_id UUID NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  tag_slug VARCHAR(100) NOT NULL,
  PRIMARY KEY (question_id, tag_slug),
  CHECK (length(trim(tag_slug)) > 0)
);

-- Enforce minimum publication gates in the database as well as in the API.
-- The question must be created as draft, populated, reviewed, then transitioned to published.
CREATE OR REPLACE FUNCTION mukul_validate_question_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_language TEXT;
  v_option_count INTEGER;
  v_answer_count INTEGER;
  v_review_type TEXT;
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM question_translations
    WHERE question_id = NEW.question_id AND language_code = 'en'
  ) OR NOT EXISTS (
    SELECT 1 FROM question_translations
    WHERE question_id = NEW.question_id AND language_code = 'bn'
  ) THEN
    RAISE EXCEPTION 'Cannot publish question %: English and Bangla translations are required', NEW.question_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM question_sources qs
    WHERE qs.question_id = NEW.question_id AND qs.supports_answer = TRUE
      AND length(trim(qs.evidence_note)) > 0
  ) THEN
    RAISE EXCEPTION 'Cannot publish question %: at least one answer-supporting source is required', NEW.question_id;
  END IF;

  FOREACH v_review_type IN ARRAY ARRAY['source','subject_matter','language','license'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM question_reviews qr
      WHERE qr.question_id = NEW.question_id
        AND qr.review_type = v_review_type
        AND qr.decision = 'approved'
    ) THEN
      RAISE EXCEPTION 'Cannot publish question %: approved % review is required', NEW.question_id, v_review_type;
    END IF;
  END LOOP;

  IF NEW.risk_level = 'high' AND NOT EXISTS (
    SELECT 1 FROM question_reviews qr
    WHERE qr.question_id = NEW.question_id
      AND qr.review_type = 'safety' AND qr.decision = 'approved'
  ) THEN
    RAISE EXCEPTION 'Cannot publish high-risk question % without approved safety review', NEW.question_id;
  END IF;

  FOREACH v_language IN ARRAY ARRAY['en','bn'] LOOP
    SELECT COUNT(*) INTO v_option_count
      FROM question_options qo
      WHERE qo.question_id = NEW.question_id AND qo.language_code = v_language;
    SELECT COUNT(*) INTO v_answer_count
      FROM correct_answers ca
      WHERE ca.question_id = NEW.question_id AND ca.language_code = v_language;

    IF v_option_count < 2 THEN
      RAISE EXCEPTION 'Cannot publish question %: at least two options required for language %', NEW.question_id, v_language;
    END IF;
    IF v_answer_count < 1 THEN
      RAISE EXCEPTION 'Cannot publish question %: at least one correct answer required for language %', NEW.question_id, v_language;
    END IF;
    IF NEW.question_type IN ('single_choice','true_false') AND v_answer_count <> 1 THEN
      RAISE EXCEPTION 'Cannot publish % question %: exactly one correct answer required for language %', NEW.question_type, NEW.question_id, v_language;
    END IF;
    IF NEW.question_type = 'true_false' AND v_option_count <> 2 THEN
      RAISE EXCEPTION 'Cannot publish true_false question %: exactly two options required for language %', NEW.question_id, v_language;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mukul_validate_question_publication ON questions;
CREATE TRIGGER trg_mukul_validate_question_publication
BEFORE INSERT OR UPDATE OF status ON questions
FOR EACH ROW
EXECUTE FUNCTION mukul_validate_question_publication();

-- Public quiz-attempt/user tables are intentionally deferred until privacy,
-- authentication, retention, and API authorization requirements are approved.

COMMIT;
