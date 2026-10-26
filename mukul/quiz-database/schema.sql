-- MUKUL Agricultural Quiz Database — PostgreSQL foundation schema
-- Version 1.4 | 2026-10-26
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
  review_sequence BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
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
-- Versioned content is authoritative for publication. Legacy unversioned tables remain
-- available only for import/compatibility; they are not used by the publication gate.
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS current_version INTEGER NOT NULL DEFAULT 1 CHECK (current_version > 0),
  ADD COLUMN IF NOT EXISTS published_version INTEGER NULL CHECK (published_version IS NULL OR published_version > 0);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_question_reviews_version'
      AND conrelid = 'question_reviews'::regclass
  ) THEN
    ALTER TABLE question_reviews
      ADD CONSTRAINT fk_question_reviews_version
      FOREIGN KEY (question_id, question_version)
      REFERENCES question_versions(question_id, version_number)
      ON DELETE RESTRICT;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS question_version_translations (
  question_id UUID NOT NULL,
  version_number INTEGER NOT NULL CHECK (version_number > 0),
  language_code VARCHAR(10) NOT NULL REFERENCES languages(language_code),
  question_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  learning_objective TEXT,
  hint TEXT,
  translation_method VARCHAR(30) NOT NULL DEFAULT 'human'
    CHECK (translation_method IN ('human','google_translate','other_machine_translation','mixed')),
  translation_review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (question_id, version_number, language_code),
  FOREIGN KEY (question_id, version_number)
    REFERENCES question_versions(question_id, version_number) ON DELETE RESTRICT,
  CHECK (length(trim(question_text)) > 0),
  CHECK (length(trim(explanation)) > 0)
);

CREATE TABLE IF NOT EXISTS question_version_options (
  option_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  option_key VARCHAR(10) NOT NULL,
  option_text TEXT NOT NULL,
  option_order SMALLINT NOT NULL,
  FOREIGN KEY (question_id, version_number, language_code)
    REFERENCES question_version_translations(question_id, version_number, language_code) ON DELETE RESTRICT,
  UNIQUE (question_id, version_number, language_code, option_key),
  UNIQUE (question_id, version_number, language_code, option_order),
  UNIQUE (option_id, question_id, version_number, language_code),
  CHECK (length(trim(option_text)) > 0),
  CHECK (option_order > 0)
);

CREATE TABLE IF NOT EXISTS question_version_answers (
  answer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  language_code VARCHAR(10) NOT NULL,
  option_id UUID NOT NULL,
  answer_explanation TEXT,
  FOREIGN KEY (option_id, question_id, version_number, language_code)
    REFERENCES question_version_options(option_id, question_id, version_number, language_code) ON DELETE RESTRICT,
  UNIQUE (question_id, version_number, language_code, option_id)
);

CREATE TABLE IF NOT EXISTS question_version_sources (
  question_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  source_id UUID NOT NULL REFERENCES sources(source_id) ON DELETE RESTRICT,
  evidence_note TEXT NOT NULL,
  supports_answer BOOLEAN NOT NULL DEFAULT TRUE,
  content_use_type VARCHAR(30) NOT NULL DEFAULT 'factual_reference',
  PRIMARY KEY (question_id, version_number, source_id),
  FOREIGN KEY (question_id, version_number)
    REFERENCES question_versions(question_id, version_number) ON DELETE RESTRICT,
  CHECK (length(trim(evidence_note)) > 0)
);

-- Separate factual citation from reuse of protected source material. Existing rows
-- default to factual_reference; content authors must explicitly mark reproduced material.
ALTER TABLE question_version_sources
  ADD COLUMN IF NOT EXISTS content_use_type VARCHAR(30) NOT NULL DEFAULT 'factual_reference';

DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_question_version_sources_content_use_type'
      AND conrelid = 'question_version_sources'::regclass
  ) THEN
    ALTER TABLE question_version_sources
      ADD CONSTRAINT chk_question_version_sources_content_use_type
      CHECK (content_use_type IN ('factual_reference','adapted_content','quoted_text','media_reuse'));
  END IF;
END;
$;

CREATE INDEX IF NOT EXISTS idx_question_reviews_version
  ON question_reviews(question_id, question_version, review_type, reviewed_at DESC);

CREATE OR REPLACE FUNCTION mukul_guard_published_version_content()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_question_id UUID;
  v_published_version INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_question_id := OLD.question_id;
  ELSE
    v_question_id := NEW.question_id;
  END IF;

  SELECT published_version INTO v_published_version
  FROM questions WHERE question_id = v_question_id;

  IF v_published_version IS NOT NULL THEN
    IF TG_OP IN ('UPDATE','DELETE') AND OLD.version_number <= v_published_version THEN
      RAISE EXCEPTION 'Published question version % of % is immutable; create a new draft version',
        OLD.version_number, v_question_id;
    END IF;
    IF TG_OP IN ('INSERT','UPDATE') AND NEW.version_number <= v_published_version THEN
      RAISE EXCEPTION 'Cannot target published question version % of %',
        NEW.version_number, v_question_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_question_version_translations ON question_version_translations;
CREATE TRIGGER trg_guard_question_version_translations
BEFORE INSERT OR UPDATE OR DELETE ON question_version_translations
FOR EACH ROW EXECUTE FUNCTION mukul_guard_published_version_content();

DROP TRIGGER IF EXISTS trg_guard_question_version_options ON question_version_options;
CREATE TRIGGER trg_guard_question_version_options
BEFORE INSERT OR UPDATE OR DELETE ON question_version_options
FOR EACH ROW EXECUTE FUNCTION mukul_guard_published_version_content();

DROP TRIGGER IF EXISTS trg_guard_question_version_answers ON question_version_answers;
CREATE TRIGGER trg_guard_question_version_answers
BEFORE INSERT OR UPDATE OR DELETE ON question_version_answers
FOR EACH ROW EXECUTE FUNCTION mukul_guard_published_version_content();

DROP TRIGGER IF EXISTS trg_guard_question_version_sources ON question_version_sources;
CREATE TRIGGER trg_guard_question_version_sources
BEFORE INSERT OR UPDATE OR DELETE ON question_version_sources
FOR EACH ROW EXECUTE FUNCTION mukul_guard_published_version_content();

CREATE OR REPLACE FUNCTION mukul_guard_question_version_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_question_id UUID;
  v_published_version INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN v_question_id := OLD.question_id;
  ELSE v_question_id := NEW.question_id;
  END IF;

  SELECT published_version INTO v_published_version
  FROM questions WHERE question_id = v_question_id;

  IF v_published_version IS NOT NULL THEN
    IF TG_OP IN ('UPDATE','DELETE') AND OLD.version_number <= v_published_version THEN
      RAISE EXCEPTION 'Published version history % is immutable', OLD.version_number;
    END IF;
    IF TG_OP IN ('INSERT','UPDATE') AND NEW.version_number <= v_published_version THEN
      RAISE EXCEPTION 'Cannot target published version history %', NEW.version_number;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_question_versions ON question_versions;
CREATE TRIGGER trg_guard_question_versions
BEFORE INSERT OR UPDATE OR DELETE ON question_versions
FOR EACH ROW EXECUTE FUNCTION mukul_guard_question_version_history();

CREATE OR REPLACE FUNCTION mukul_guard_question_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.published_version IS NOT NULL OR OLD.status = 'published' THEN
      RAISE EXCEPTION 'A published question cannot be deleted; retire it instead';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.status = 'published' AND NEW.status NOT IN ('published','retired') THEN
    RAISE EXCEPTION 'A published question cannot return to draft; create a new version or retire it';
  END IF;
  IF OLD.status = 'retired' AND NEW.status <> 'retired' THEN
    RAISE EXCEPTION 'A retired question is terminal; create a replacement question if needed';
  END IF;
  IF NEW.published_version IS DISTINCT FROM OLD.published_version
     AND NOT (NEW.status = 'published' AND NEW.published_version = NEW.current_version) THEN
    RAISE EXCEPTION 'published_version can only be set to the current version during publication';
  END IF;
  IF NEW.current_version < OLD.current_version THEN
    RAISE EXCEPTION 'current_version cannot decrease';
  END IF;

  IF OLD.published_version IS NOT NULL
     AND NEW.current_version <= OLD.published_version
     AND (NEW.topic_id, NEW.question_type, NEW.difficulty, NEW.geographic_scope,
          NEW.target_audiences, NEW.risk_level, NEW.canonical_fingerprint)
         IS DISTINCT FROM
         (OLD.topic_id, OLD.question_type, OLD.difficulty, OLD.geographic_scope,
          OLD.target_audiences, OLD.risk_level, OLD.canonical_fingerprint) THEN
    RAISE EXCEPTION 'Metadata for published version % is immutable; advance current_version first', OLD.published_version;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mukul_guard_question_lifecycle ON questions;
CREATE TRIGGER trg_mukul_guard_question_lifecycle
BEFORE UPDATE OR DELETE ON questions
FOR EACH ROW EXECUTE FUNCTION mukul_guard_question_lifecycle();

CREATE OR REPLACE FUNCTION mukul_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_questions_updated_at ON questions;
CREATE TRIGGER trg_questions_updated_at
BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION mukul_set_updated_at();

DROP TRIGGER IF EXISTS trg_question_translations_updated_at ON question_translations;
CREATE TRIGGER trg_question_translations_updated_at
BEFORE UPDATE ON question_translations
FOR EACH ROW EXECUTE FUNCTION mukul_set_updated_at();

CREATE OR REPLACE FUNCTION mukul_validate_question_publication()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_language TEXT;
  v_option_count INTEGER;
  v_answer_count INTEGER;
  v_review_type TEXT;
  v_latest_decision TEXT;
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'published'
     AND OLD.published_version = NEW.current_version
     AND NEW.published_version = NEW.current_version THEN
    RETURN NEW;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM question_versions qv
    WHERE qv.question_id = NEW.question_id AND qv.version_number = NEW.current_version
  ) THEN
    RAISE EXCEPTION 'Cannot publish question %: version % history/snapshot is required',
      NEW.question_id, NEW.current_version;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM question_version_translations
      WHERE question_id = NEW.question_id AND version_number = NEW.current_version AND language_code = 'en')
     OR NOT EXISTS (SELECT 1 FROM question_version_translations
      WHERE question_id = NEW.question_id AND version_number = NEW.current_version AND language_code = 'bn') THEN
    RAISE EXCEPTION 'Cannot publish question % version %: English and Bangla translations are required',
      NEW.question_id, NEW.current_version;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM question_version_sources
      WHERE question_id = NEW.question_id AND version_number = NEW.current_version
        AND supports_answer = TRUE AND length(trim(evidence_note)) > 0) THEN
    RAISE EXCEPTION 'Cannot publish question % version %: an answer-supporting source is required',
      NEW.question_id, NEW.current_version;
  END IF;

  FOREACH v_review_type IN ARRAY ARRAY['source','subject_matter','language','license'] LOOP
    SELECT qr.decision INTO v_latest_decision
    FROM question_reviews qr
    WHERE qr.question_id = NEW.question_id
      AND qr.question_version = NEW.current_version
      AND qr.review_type = v_review_type
    ORDER BY qr.reviewed_at DESC, qr.review_sequence DESC
    LIMIT 1;
    IF v_latest_decision IS DISTINCT FROM 'approved' THEN
      RAISE EXCEPTION 'Cannot publish question % version %: latest % review must be approved',
        NEW.question_id, NEW.current_version, v_review_type;
    END IF;
  END LOOP;

  IF NEW.risk_level = 'high' THEN
    SELECT qr.decision INTO v_latest_decision
    FROM question_reviews qr
    WHERE qr.question_id = NEW.question_id
      AND qr.question_version = NEW.current_version
      AND qr.review_type = 'safety'
    ORDER BY qr.reviewed_at DESC, qr.review_id DESC
    LIMIT 1;
    IF v_latest_decision IS DISTINCT FROM 'approved' THEN
      RAISE EXCEPTION 'Cannot publish high-risk question % version % without current-version safety approval',
        NEW.question_id, NEW.current_version;
    END IF;
  END IF;

  FOREACH v_language IN ARRAY ARRAY['en','bn'] LOOP
    SELECT COUNT(*) INTO v_option_count FROM question_version_options
    WHERE question_id = NEW.question_id AND version_number = NEW.current_version AND language_code = v_language;
    SELECT COUNT(*) INTO v_answer_count FROM question_version_answers
    WHERE question_id = NEW.question_id AND version_number = NEW.current_version AND language_code = v_language;
    IF v_option_count < 2 THEN
      RAISE EXCEPTION 'Cannot publish question % version %: at least two options required for language %',
        NEW.question_id, NEW.current_version, v_language;
    END IF;
    IF v_answer_count < 1 THEN
      RAISE EXCEPTION 'Cannot publish question % version %: at least one correct answer required for language %',
        NEW.question_id, NEW.current_version, v_language;
    END IF;
    IF NEW.question_type IN ('single_choice','true_false') AND v_answer_count <> 1 THEN
      RAISE EXCEPTION 'Cannot publish % question % version %: exactly one correct answer required for language %',
        NEW.question_type, NEW.question_id, NEW.current_version, v_language;
    END IF;
    IF NEW.question_type = 'true_false' AND v_option_count <> 2 THEN
      RAISE EXCEPTION 'Cannot publish true_false question % version %: exactly two options required for language %',
        NEW.question_id, NEW.current_version, v_language;
    END IF;
  END LOOP;

  -- English and Bangla must use identical option keys and identical correct-answer keys.
  IF EXISTS (
    SELECT 1
    FROM question_version_options en
    FULL JOIN question_version_options bn
      ON bn.question_id = en.question_id
     AND bn.version_number = en.version_number
     AND bn.option_key = en.option_key
     AND en.language_code = 'en'
     AND bn.language_code = 'bn'
    WHERE (en.question_id = NEW.question_id AND en.version_number = NEW.current_version AND en.language_code = 'en')
       OR (bn.question_id = NEW.question_id AND bn.version_number = NEW.current_version AND bn.language_code = 'bn')
    GROUP BY COALESCE(en.option_key, bn.option_key)
    HAVING COUNT(*) FILTER (WHERE en.option_id IS NOT NULL) <> 1
        OR COUNT(*) FILTER (WHERE bn.option_id IS NOT NULL) <> 1
  ) THEN
    RAISE EXCEPTION 'Cannot publish question % version %: English and Bangla option keys must match',
      NEW.question_id, NEW.current_version;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM (
      SELECT a.language_code, array_agg(o.option_key ORDER BY o.option_key) AS correct_keys
      FROM question_version_answers a
      JOIN question_version_options o
        ON o.option_id = a.option_id
       AND o.question_id = a.question_id
       AND o.version_number = a.version_number
       AND o.language_code = a.language_code
      WHERE a.question_id = NEW.question_id
        AND a.version_number = NEW.current_version
        AND a.language_code IN ('en','bn')
      GROUP BY a.language_code
    ) answer_sets
    GROUP BY correct_keys
    HAVING COUNT(*) <> 2
  ) OR (
    SELECT COUNT(DISTINCT language_code)
    FROM question_version_answers
    WHERE question_id = NEW.question_id
      AND version_number = NEW.current_version
      AND language_code IN ('en','bn')
  ) <> 2 THEN
    RAISE EXCEPTION 'Cannot publish question % version %: English and Bangla correct-answer keys must match',
      NEW.question_id, NEW.current_version;
  END IF;

  -- Factual citation is distinct from reproducing protected source material.
  -- Any adapted, quoted, or media reuse must have an explicit reuse disposition.
  -- Open-license content must name the license; question-level license review is
  -- independently required above. Unknown/unassessed rights never authorize reuse.
  IF EXISTS (
    SELECT 1
    FROM question_version_sources qvs
    JOIN sources s ON s.source_id = qvs.source_id
    WHERE qvs.question_id = NEW.question_id
      AND qvs.version_number = NEW.current_version
      AND qvs.supports_answer = TRUE
      AND qvs.content_use_type IN ('adapted_content','quoted_text','media_reuse')
      AND (
        s.reuse_permission_status NOT IN ('open_license','permission_granted','public_domain')
        OR (
          s.reuse_permission_status = 'open_license'
          AND NULLIF(trim(s.license_name), '') IS NULL
        )
      )
  ) THEN
    RAISE EXCEPTION 'Cannot publish question % version %: reproduced source material requires explicit reuse permission and an identified open license where applicable',
      NEW.question_id, NEW.current_version;
  END IF;

  NEW.published_version := NEW.current_version;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mukul_validate_question_publication ON questions;
CREATE TRIGGER trg_mukul_validate_question_publication
BEFORE INSERT OR UPDATE OF status, published_version ON questions
FOR EACH ROW EXECUTE FUNCTION mukul_validate_question_publication();

-- Public quiz-attempt/user tables are intentionally deferred until privacy,
-- authentication, retention, and API authorization requirements are approved.

COMMIT;
