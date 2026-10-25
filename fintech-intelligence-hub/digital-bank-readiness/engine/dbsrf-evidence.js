/* DBSRF evidence inventory. Independent of existing site tools. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DBSRFEvidence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const QUESTION_IDS = new Set([
    "GOV-01","GOV-02","GOV-03","GOV-04","PRU-01","PRU-02","PRU-03","PRU-04",
    "ICT-01","ICT-02","ICT-03","ICT-04","AML-01","AML-02","AML-03","AML-04",
    "DAT-01","DAT-02","DAT-03","DAT-04","CON-01","CON-02","CON-03","CON-04",
    "REP-01","REP-02","REP-03","REP-04"
  ]);
  const CONFIDENCE = new Set(["High","Moderate","Low","Unverified"]);
  const STATUS = new Set(["Draft","Collected","Reviewed","Superseded","Rejected"]);
  const RELEVANCE = new Set(["Relevant","Partially relevant","Not relevant","Not assessed"]);
  const SUFFICIENCY = new Set(["Sufficient","Partially sufficient","Insufficient","Not assessed"]);

  function plainObject(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function validDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  }

  function validateInventory(artifacts) {
    const errors = [];
    if (!Array.isArray(artifacts)) return { valid:false, errors:["Evidence inventory must be an array."], summary:null };
    const seenIds = new Set();
    const questionLinkCounts = {};
    artifacts.forEach(function (artifact, index) {
      const prefix = "Artifact[" + index + "]";
      if (!plainObject(artifact)) { errors.push(prefix + " must be an object."); return; }
      if (typeof artifact.id !== "string" || !artifact.id.trim()) errors.push(prefix + ": id is required.");
      else if (seenIds.has(artifact.id)) errors.push(prefix + ": duplicate artifact ID " + artifact.id + ".");
      else seenIds.add(artifact.id);
      if (!Number.isInteger(artifact.version) || artifact.version < 1) errors.push(prefix + ": version must be a positive integer.");
      if (!validDate(artifact.artifactDate)) errors.push(prefix + ": artifactDate must be a valid YYYY-MM-DD date.");
      if (typeof artifact.owner !== "string" || !artifact.owner.trim()) errors.push(prefix + ": owner is required.");
      if (!CONFIDENCE.has(artifact.confidence)) errors.push(prefix + ": confidence must be High, Moderate, Low, or Unverified.");
      if (!STATUS.has(artifact.status)) errors.push(prefix + ": status must be Draft, Collected, Reviewed, Superseded, or Rejected.");
      if (!Array.isArray(artifact.questionLinks) || artifact.questionLinks.length === 0) {
        errors.push(prefix + ": at least one questionLinks entry is required.");
        return;
      }
      const linked = new Set();
      artifact.questionLinks.forEach(function (link, linkIndex) {
        const p = prefix + ".questionLinks[" + linkIndex + "]";
        if (!plainObject(link)) { errors.push(p + " must be an object."); return; }
        if (!QUESTION_IDS.has(link.questionId)) errors.push(p + ": unknown questionId.");
        else {
          if (linked.has(link.questionId)) errors.push(p + ": duplicate link to " + link.questionId + " in this artifact.");
          linked.add(link.questionId);
          questionLinkCounts[link.questionId] = (questionLinkCounts[link.questionId] || 0) + 1;
        }
        if (!RELEVANCE.has(link.relevance)) errors.push(p + ": invalid relevance status.");
        if (!SUFFICIENCY.has(link.sufficiency)) errors.push(p + ": invalid sufficiency status.");
        if (link.reviewedAt !== undefined && !validDate(link.reviewedAt)) errors.push(p + ": reviewedAt must be YYYY-MM-DD.");
        if (link.reviewer !== undefined && (typeof link.reviewer !== "string" || !link.reviewer.trim())) errors.push(p + ": reviewer must be non-empty when supplied.");
        if (link.notes !== undefined && typeof link.notes !== "string") errors.push(p + ": notes must be a string when supplied.");
        if ((link.relevance === "Not assessed" || link.sufficiency === "Not assessed") &&
            (link.reviewer !== undefined || link.reviewedAt !== undefined)) {
          errors.push(p + ": reviewer and reviewedAt must not imply completion when relevance/sufficiency is Not assessed.");
        }
      });
    });
    const linkedQuestionIds = Object.keys(questionLinkCounts);
    return {
      valid: errors.length === 0,
      errors: errors,
      summary: {
        artifactCount: artifacts.length,
        uniqueArtifactIds: seenIds.size,
        questionLinks: Object.values(questionLinkCounts).reduce(function (a,b) { return a+b; }, 0),
        linkedQuestionCount: linkedQuestionIds.length,
        unlinkedQuestionIds: Array.from(QUESTION_IDS).filter(function (id) { return !questionLinkCounts[id]; })
      }
    };
  }

  function getQuestionEvidence(artifacts, questionId) {
    if (!QUESTION_IDS.has(questionId)) throw new Error("Unknown DBSRF question ID: " + questionId);
    if (!Array.isArray(artifacts)) throw new Error("Evidence inventory must be an array.");
    return artifacts.flatMap(function (artifact) {
      if (!artifact || !Array.isArray(artifact.questionLinks)) return [];
      return artifact.questionLinks.filter(function (link) { return link && link.questionId === questionId; })
        .map(function (link) { return { artifactId: artifact.id, version: artifact.version, artifactStatus: artifact.status,
          confidence: artifact.confidence, relevance: link.relevance, sufficiency: link.sufficiency,
          reviewer: link.reviewer || null, reviewedAt: link.reviewedAt || null, notes: link.notes || "" }; });
    });
  }

  function summarizeQuestionEvidence(artifacts, questionId) {
    const links = getQuestionEvidence(artifacts, questionId);
    const usable = links.filter(function (x) {
      return x.artifactStatus === "Reviewed" && x.relevance === "Relevant" &&
        x.sufficiency === "Sufficient" && x.confidence !== "Unverified";
    });
    return {
      questionId: questionId,
      linkedArtifacts: links.length,
      reviewedSufficientArtifacts: usable.length,
      status: usable.length ? "Reviewed evidence linked — professional judgment still required" :
        links.length ? "Evidence linked but sufficiency/relevance not established" : "No evidence linked",
      artifactIds: links.map(function (x) { return x.artifactId; })
    };
  }

  return Object.freeze({ validateInventory:validateInventory, getQuestionEvidence:getQuestionEvidence,
    summarizeQuestionEvidence:summarizeQuestionEvidence });
});
