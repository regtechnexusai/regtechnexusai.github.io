-- PostgreSQL integration smoke/regression tests for MUKUL quiz publication.
-- Run after schema.sql in a fresh disposable database with psql -v ON_ERROR_STOP=1.
\set ON_ERROR_STOP on

DO $$
DECLARE
  t UUID;
  q UUID;
  src UUID;
  opt_en_a UUID; opt_en_b UUID; opt_bn_a UUID; opt_bn_b UUID;
  failed BOOLEAN;
  r TEXT;
BEGIN
  INSERT INTO topics(slug) VALUES ('test-topic-' || substr(gen_random_uuid()::text,1,8)) RETURNING topic_id INTO t;
  INSERT INTO questions(topic_id,question_type,difficulty,status,risk_level)
    VALUES (t,'single_choice','basic','draft','low') RETURNING question_id INTO q;
  INSERT INTO question_versions(question_id,version_number,change_summary,changed_by_role,snapshot)
    VALUES(q,1,'Test fixture v1','test_runner','{"version":1}');
  INSERT INTO question_version_translations(question_id,version_number,language_code,question_text,explanation)
    VALUES (q,1,'en','Which option is correct?','Because the test fixture says so.'),
           (q,1,'bn','কোন বিকল্পটি সঠিক?','পরীক্ষার নমুনা অনুযায়ী।');
  INSERT INTO question_version_options(question_id,version_number,language_code,option_key,option_text,option_order)
    VALUES(q,1,'en','A','Correct',1),(q,1,'en','B','Incorrect',2),
          (q,1,'bn','A','সঠিক',1),(q,1,'bn','B','ভুল',2);
  SELECT option_id INTO opt_en_a FROM question_version_options WHERE question_id=q AND version_number=1 AND language_code='en' AND option_key='A';
  SELECT option_id INTO opt_en_b FROM question_version_options WHERE question_id=q AND version_number=1 AND language_code='en' AND option_key='B';
  SELECT option_id INTO opt_bn_a FROM question_version_options WHERE question_id=q AND version_number=1 AND language_code='bn' AND option_key='A';
  SELECT option_id INTO opt_bn_b FROM question_version_options WHERE question_id=q AND version_number=1 AND language_code='bn' AND option_key='B';
  INSERT INTO question_version_answers(question_id,version_number,language_code,option_id)
    VALUES(q,1,'en',opt_en_a),(q,1,'bn',opt_bn_a);
  INSERT INTO sources(publisher,title,source_url,source_type,license_name,reuse_permission_status)
    VALUES('MUKUL test fixture','Synthetic test source','https://example.invalid/test-source','web','test-only','permission_granted')
    RETURNING source_id INTO src;
  INSERT INTO question_version_sources(question_id,version_number,source_id,evidence_note,supports_answer)
    VALUES(q,1,src,'Synthetic evidence note for database test',TRUE);
  INSERT INTO question_reviews(question_id,question_version,reviewer_role,review_type,decision,rationale)
    VALUES(q,1,'test_runner','source','approved','test approval'),
          (q,1,'test_runner','subject_matter','approved','test approval'),
          (q,1,'test_runner','language','approved','test approval'),
          (q,1,'test_runner','license','approved','test approval');

  -- N0a: a draft cannot set published_version directly, bypassing review.
  failed := FALSE;
  BEGIN
    UPDATE questions SET published_version=1 WHERE question_id=q;
  EXCEPTION WHEN OTHERS THEN failed := TRUE;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'N0a failed: draft directly set published_version'; END IF;

  -- N0b: English/Bangla correct-answer keys must match.
  UPDATE question_version_answers
    SET option_id=opt_bn_b
    WHERE question_id=q AND version_number=1 AND language_code='bn';
  failed := FALSE;
  BEGIN
    UPDATE questions SET status='published' WHERE question_id=q;
  EXCEPTION WHEN OTHERS THEN failed := TRUE;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'N0b failed: English/Bangla correct-answer mismatch was accepted'; END IF;
  UPDATE question_version_answers
    SET option_id=opt_bn_a
    WHERE question_id=q AND version_number=1 AND language_code='bn';

  -- N0c: restricted/link_only supporting sources cannot pass the license gate.
  UPDATE sources SET reuse_permission_status='link_only' WHERE source_id=src;
  failed := FALSE;
  BEGIN
    UPDATE questions SET status='published' WHERE question_id=q;
  EXCEPTION WHEN OTHERS THEN failed := TRUE;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'N0c failed: link_only supporting source passed the license gate'; END IF;
  UPDATE sources SET reuse_permission_status='permission_granted' WHERE source_id=src;

  -- P1: fully reviewed bilingual version publishes successfully.
  UPDATE questions SET status='published' WHERE question_id=q;
  IF (SELECT published_version FROM questions WHERE question_id=q) <> 1 THEN
    RAISE EXCEPTION 'P1 failed: version 1 did not become active';
  END IF;

  -- N1: published version content must be immutable.
  failed := FALSE;
  BEGIN
    UPDATE question_version_translations SET question_text='tampered'
      WHERE question_id=q AND version_number=1 AND language_code='en';
  EXCEPTION WHEN OTHERS THEN failed := TRUE;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'N1 failed: published content mutation was accepted'; END IF;

  -- Prepare v2, intentionally reusing only v1 reviews at first.
  UPDATE questions SET current_version=2 WHERE question_id=q;
  INSERT INTO question_versions(question_id,version_number,change_summary,changed_by_role,snapshot)
    VALUES(q,2,'Test fixture v2','test_runner','{"version":2}');
  INSERT INTO question_version_translations(question_id,version_number,language_code,question_text,explanation)
    VALUES (q,2,'en','Version two question?','Version two explanation.'),
           (q,2,'bn','দ্বিতীয় সংস্করণের প্রশ্ন?','দ্বিতীয় সংস্করণের ব্যাখ্যা।');
  INSERT INTO question_version_options(question_id,version_number,language_code,option_key,option_text,option_order)
    VALUES(q,2,'en','A','Correct',1),(q,2,'en','B','Incorrect',2),
          (q,2,'bn','A','সঠিক',1),(q,2,'bn','B','ভুল',2);
  SELECT option_id INTO opt_en_a FROM question_version_options WHERE question_id=q AND version_number=2 AND language_code='en' AND option_key='A';
  SELECT option_id INTO opt_bn_a FROM question_version_options WHERE question_id=q AND version_number=2 AND language_code='bn' AND option_key='A';
  INSERT INTO question_version_answers(question_id,version_number,language_code,option_id)
    VALUES(q,2,'en',opt_en_a),(q,2,'bn',opt_bn_a);
  INSERT INTO question_version_sources(question_id,version_number,source_id,evidence_note,supports_answer)
    VALUES(q,2,src,'Version two evidence note',TRUE);

  -- N2: approvals from v1 must not authorize v2.
  failed := FALSE;
  BEGIN
    UPDATE questions SET status='published' WHERE question_id=q;
  EXCEPTION WHEN OTHERS THEN
    failed := TRUE;
    GET STACKED DIAGNOSTICS r = MESSAGE_TEXT;
  END;
  IF NOT failed OR r NOT LIKE '%version 2%' THEN
    RAISE EXCEPTION 'N2 failed: unreviewed v2 was not blocked (message=%)', r;
  END IF;
  IF (SELECT published_version FROM questions WHERE question_id=q) <> 1 THEN
    RAISE EXCEPTION 'N3 failed: failed publication changed active version';
  END IF;

  -- P2: version 2 publishes after its own approvals are recorded.
  INSERT INTO question_reviews(question_id,question_version,reviewer_role,review_type,decision,rationale)
    VALUES(q,2,'test_runner','source','approved','v2 test approval'),
          (q,2,'test_runner','subject_matter','approved','v2 test approval'),
          (q,2,'test_runner','language','approved','v2 test approval'),
          (q,2,'test_runner','license','approved','v2 test approval');
  UPDATE questions SET status='published' WHERE question_id=q;
  IF (SELECT published_version FROM questions WHERE question_id=q) <> 2 THEN
    RAISE EXCEPTION 'P2 failed: version 2 did not become active';
  END IF;

  -- N4: latest changes_requested decision must override earlier approval.
  INSERT INTO question_reviews(question_id,question_version,reviewer_role,review_type,decision,rationale)
    VALUES(q,2,'test_runner','language','changes_requested','negative test: needs revision');
  UPDATE questions SET current_version=3 WHERE question_id=q;
  INSERT INTO question_versions(question_id,version_number,change_summary,changed_by_role,snapshot)
    VALUES(q,3,'Test fixture v3','test_runner','{"version":3}');
  -- Attempting to publish an incomplete version must fail and preserve v2.
  failed := FALSE;
  BEGIN
    UPDATE questions SET status='published' WHERE question_id=q;
  EXCEPTION WHEN OTHERS THEN failed := TRUE;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'N4 failed: incomplete v3 was accepted'; END IF;
  IF (SELECT published_version FROM questions WHERE question_id=q) <> 2 THEN
    RAISE EXCEPTION 'N5 failed: failed v3 publication changed active version';
  END IF;

  -- High-risk items require a current-version safety approval.
  UPDATE questions SET current_version=3, risk_level='high' WHERE question_id=q;
  -- v3 is intentionally incomplete; its publication is already expected to fail above.
END;
$$;

SELECT 'MUKUL quiz database smoke tests passed: bilingual publication, version-scoped reviews, immutable published content, failed-publication rollback.' AS test_result;
