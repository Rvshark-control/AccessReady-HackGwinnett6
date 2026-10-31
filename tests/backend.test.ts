import assert from "node:assert/strict";
import { test } from "node:test";
import { clinics } from "../data/clinics";
import { effectiveStatus, matchClinic, matchClinics } from "../lib/accessready/match";
import { REQUIREMENT_IDS, type Clinic } from "../lib/accessready/types";
import { DEMO_REQUIREMENTS } from "../lib/accessready/requirements";
import { ValidationError, validateRequirements } from "../lib/accessready/validation";
import { GET as getClinics } from "../app/api/clinics/route";
import { POST as postMatch } from "../app/api/match/route";
import { GET as health } from "../app/api/health/route";

const request = (body: unknown) => new Request("http://localhost/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("dataset has 12 complete, unique synthetic facilities with valid evidence and contact details", () => {
  assert.equal(clinics.length, 12);
  assert.equal(new Set(clinics.map((clinic) => clinic.id)).size, 12);
  const coverage = new Set<string>();
  for (const clinic of clinics) {
    assert.equal(Object.keys(clinic.accommodations).length, REQUIREMENT_IDS.length);
    assert.match(clinic.city, /fictional/);
    assert.match(clinic.phone, /^\(212\) 555-01\d\d$/);
    assert.ok(clinic.email.endsWith(".example"));
    assert.ok(["verified", "self-reported", "unverified"].includes(clinic.verification));
    assert.ok(Number.isFinite(clinic.location.latitude) && Number.isFinite(clinic.location.longitude));
    for (const id of REQUIREMENT_IDS) {
      const accommodation = clinic.accommodations[id];
      assert.ok(["supported", "unsupported", "unknown"].includes(accommodation.status));
      assert.ok(["verified", "self-reported", "unverified"].includes(accommodation.verification));
      assert.ok(accommodation.detail.length > 20);
      coverage.add(effectiveStatus(accommodation));
    }
  }
  assert.deepEqual([...coverage].sort(), ["supported", "unknown", "unsupported"]);
});

test("the two-minute demo has full, missing, and unknown matches", () => {
  const results = matchClinics(clinics, DEMO_REQUIREMENTS);
  assert.equal(results[0].score, 100);
  assert.equal(results.find((item) => item.clinic.id === "willow-family-care")?.score, 100);
  const missing = results.find((item) => item.clinic.id === "harborview-wellness")!;
  assert.equal(missing.score, 50);
  assert.equal(missing.unsupported[0].requirement, "adjustable_exam_table");
  const unknown = results.find((item) => item.clinic.id === "tidewell-specialty-care")!;
  assert.equal(unknown.score, 50);
  assert.equal(unknown.unknown[0].requirement, "adjustable_exam_table");
  assert.ok(results.indexOf(unknown) < results.indexOf(missing));
});

test("self-reported and unverified assertions never count as confirmed support or absence", () => {
  for (const status of ["supported", "unsupported"] as const) {
    for (const verification of ["self-reported", "unverified"] as const) {
      assert.equal(effectiveStatus({ status, verification, detail: "Test evidence." }), "unknown");
    }
  }
  assert.equal(effectiveStatus(undefined), "unknown");
});

test("scores count every requirement equally and round down", () => {
  const match = matchClinic(clinics[0], ["wheelchair_entrance", "adjustable_exam_table", "reduced_lighting"]);
  assert.equal(match.score, 66);
  assert.equal(match.supported.length, 2);
  assert.equal(match.unknown.length, 1);
  assert.match(match.explanation, /2 of 3/);
});

test("missing data is unknown rather than supported", () => {
  const clinic = structuredClone(clinics[0]);
  delete (clinic.accommodations as Partial<Clinic["accommodations"]>).wheelchair_entrance;
  const match = matchClinic(clinic, ["wheelchair_entrance"]);
  assert.equal(match.score, 0);
  assert.equal(match.unknown.length, 1);
});

test("empty requirements produce no percentage; duplicate internal inputs do not inflate a score", () => {
  assert.equal(matchClinic(clinics[0], []).score, null);
  assert.equal(matchClinic(clinics[0], ["wheelchair_entrance", "wheelchair_entrance"]).supported.length, 1);
});

test("ranking is deterministic, independent of catalog or requirement order", () => {
  const ids = (list: typeof clinics, needs = DEMO_REQUIREMENTS) => matchClinics(list, needs).map((result) => result.clinic.id);
  assert.deepEqual(ids(clinics), ids([...clinics].reverse(), [...DEMO_REQUIREMENTS].reverse()));
});

test("all single and paired requirements satisfy the scoring and partition invariants", () => {
  for (const clinic of clinics) {
    for (const first of REQUIREMENT_IDS) {
      for (const second of REQUIREMENT_IDS) {
        const selected = [...new Set([first, second])];
        const result = matchClinic(clinic, selected);
        assert.equal(result.supported.length + result.unsupported.length + result.unknown.length, selected.length);
        assert.equal(result.score, Math.floor(result.supported.length / selected.length * 100));
        if (result.unknown.length || result.unsupported.length) assert.ok(result.score! < 100);
      }
    }
  }
});

test("validation accepts only known, unique requirement IDs without personal fields", () => {
  assert.deepEqual(validateRequirements({ requirements: [] }), []);
  assert.deepEqual(validateRequirements({ requirements: [...REQUIREMENT_IDS] }), [...REQUIREMENT_IDS]);
  for (const invalid of [null, [], "needs", {}, { requirements: null }, { requirements: "wheelchair_entrance" }, { requirements: [7] }, { requirements: ["not_real"] }, { requirements: ["wheelchair_entrance", "wheelchair_entrance"] }, { requirements: [], diagnosis: "private" }, { requirements: Array(17).fill("wheelchair_entrance") }]) {
    assert.throws(() => validateRequirements(invalid), ValidationError);
  }
});

test("clinic API returns the catalog and supports search, specialty, evidence, and ID filtering", async () => {
  const response = await getClinics(new Request("http://localhost/api/clinics"));
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.total, 12);
  assert.equal(payload.synthetic, true);
  for (const [query, count] of [["q=willow", 1], ["specialty=Dental%20care", 2], ["verification=unverified", 2], ["id=willow-family-care", 1], ["q=doesnotexist", 0]] as const) {
    assert.equal((await (await getClinics(new Request(`http://localhost/api/clinics?${query}`))).json()).total, count);
  }
});

test("clinic API rejects invalid filters and missing facility IDs", async () => {
  for (const query of ["verification=wrong", "specialty=wrong", `q=${"a".repeat(101)}`]) {
    assert.equal((await getClinics(new Request(`http://localhost/api/clinics?${query}`))).status, 400);
  }
  assert.equal((await getClinics(new Request("http://localhost/api/clinics?id=missing"))).status, 404);
});

test("matching API returns real ranked matches and rejects malformed or oversized requests", async () => {
  const response = await postMatch(request({ requirements: DEMO_REQUIREMENTS }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const payload = await response.json();
  assert.equal(payload.results.length, 12);
  assert.equal(payload.results[0].score, 100);
  assert.equal(payload.synthetic, true);
  assert.equal((await postMatch(request({ requirements: ["wrong"] }))).status, 400);
  assert.equal((await postMatch(request({ requirements: [], patientName: "not accepted" }))).status, 400);
  assert.equal((await postMatch(new Request("http://localhost/api/match", { method: "POST", body: "{}" }))).status, 415);
  assert.equal((await postMatch(new Request("http://localhost/api/match", { method: "POST", headers: { "Content-Type": "application/jsonp" }, body: "{}" }))).status, 415);
  assert.equal((await postMatch(new Request("http://localhost/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }))).status, 400);
  assert.equal((await postMatch(request({ requirements: ["a".repeat(5000)] }))).status, 413);
});

test("health endpoint reports the bundled dataset", async () => {
  const response = await health();
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.status, "ok");
  assert.equal(payload.facilityCount, 12);
});
