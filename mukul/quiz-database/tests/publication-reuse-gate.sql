-- PostgreSQL integration regression for source reuse publication policy.
-- Run against a disposable database after schema.sql has been applied.
DO $$
DECLARE
  v_status TEXT;
  v_use_type TEXT;
  v_allowed_statuses TEXT[] := ARRAY['open_license','permission_granted','public_domain'];
  v_all_statuses TEXT[] := ARRAY['not_assessed','unknown','restricted','link_only','open_license','permission_granted','public_domain'];
  v_use_types TEXT[] := ARRAY['factual_reference','adapted_content','quoted_text','media_reuse'];
  v_question UUID;
  v_topic UUID;
  v_source UUID;
  v_option_en_a UUID;
  v_option_en_b UUID;
  v_option_bn_a UUID;
  v_option_bn_b UUID;
  v_license TEXT;
  v_expected_block BOOLEAN;
  v_published BOOLEAN;
  v_review_type TEXT;
  v_error TEXT;
BEGIN
  FOREACH v_status IN ARRAY v_all_statuses LOOP
    FOREACH v_use_type IN ARRAY v_use_types LOOP
      v_question := gen_random_uuid();
      v_topic := gen_random_uuid();
      v_source := gen_random_uuid();
      v_option_en_a := gen_random_uuid();
      v_option_en_b := gen_random_uuid();
      v_option_bn_a := gen_random_uuid();
      v_option_bn_b := gen_random_uuid();
      v_license := CASE
        WHEN v_status = 'open_license' THEN 'CC BY 4.0'
        WHEN v_status = 'permission_granted' THEN 'Test fixture permission reference'
        WHEN v_status = 'public_domain' THEN 'Test fixture public-domain basis'
        ELSE NULL
      END;

      INSERT INTO topics (topic_id, slug) VALUES (v_topic, 'reuse-test-' || replace(v_topic::text, '-', ''));
      INSERT INTO questions (question_id, topic_id, question_type, difficulty, status)
        VALUES (v_question, v_topic, 'single_choice', 'basic', 'draft');
      INSERT INTO question_versions (question_id, version_number, change_summary, changed_by_role, snapshot)
        VALUES (v_question, 1, 'Source reuse gate test fixture', 'test', '{}'::jsonb);
      INSERT INTO question_version_translations
        (question_id, version_number, language_code, question_text, explanation)
      VALUES
        (v_question, 1, 'en', 'Test question?', 'Test explanation.'),
        (v_question, 1, 'bn', 'পরীক্ষার প্রশ্ন?', 'পরীক্ষার ব্যাখ্যা।');

      INSERT INTO question_version_options
        (option_id, question_id, version_number, language_code, option_key, option_text, option_order)
      VALUES
        (v_option_en_a, v_question, 1, 'en', 'A', 'Correct', 1),
        (v_option_en_b, v_question, 1, 'en', 'B', 'Incorrect', 2),
        (v_option_bn_a, v_question, 1, 'bn', 'A', 'সঠিক', 1),
        (v_option_bn_b, v_question, 1, 'bn', 'B', 'ভুল', 2);
      INSERT INTO question_version_answers
        (question_id, version_number, language_code, option_id)
      VALUES
        (v_question, 1, 'en', v_option_en_a),
        (v_question, 1, 'bn', v_option_bn_a);

      INSERT INTO sources
        (source_id, publisher, title, source_url, license_name, reuse_permission_status)
      VALUES
        (v_source, 'MUKUL test fixture', 'Source reuse gate test source',
         'https://example.invalid/source-reuse-test', v_license, v_status);
      INSERT INTO question_version_sources
        (question_id, version_number, source_id, evidence_note, supports_answer, content_use_type)
      VALUES
        (v_question, 1, v_source, 'Synthetic integration-test evidence note', TRUE, v_use_type);

      FOREACH v_review_type IN ARRAY ARRAY['source','subject_matter','language','license'] LOOP
        INSERT INTO question_reviews
          (question_id, question_version, reviewer_role, review_type, decision, rationale)
        VALUES
          (v_question, 1, 'automated_test_fixture', v_review_type, 'approved',
           'Synthetic integration test fixture; not a real content approval.');
      END LOOP;

      v_expected_block :=
        v_use_type <> 'factual_reference'
        AND (
          NOT (v_status = ANY(v_allowed_statuses))
          OR (v_status = 'open_license' AND NULLIF(trim(v_license), '') IS NULL)
        );
      v_published := TRUE;
      BEGIN
        UPDATE questions SET status = 'published' WHERE question_id = v_question;
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
        v_published := FALSE;
        IF NOT v_expected_block
           OR v_error NOT LIKE 'Cannot publish question %: reproduced source material requires explicit reuse permission%' THEN
          RAISE EXCEPTION 'Unexpected publication rejection for reuse status %, use type %: %',
            v_status, v_use_type, v_error;
        END IF;
      END;

      IF v_expected_block AND v_published THEN
        RAISE EXCEPTION 'Publication incorrectly allowed for reuse status %, use type %',
          v_status, v_use_type;
      END IF;
      IF NOT v_expected_block AND NOT v_published THEN
        RAISE EXCEPTION 'Publication unexpectedly blocked for reuse status %, use type %',
          v_status, v_use_type;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'PASS: factual references and all 7 source statuses; adapted/quoted/media reuse blocked unless rights are explicit (28 combinations).';
END;
$$;
