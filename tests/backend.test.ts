import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../app/api/clinics/route";
import { POST } from "../app/api/match/route";
import { clinics } from "../data/clinics";
import { matchClinic, matchClinics } from "../lib/accessready/match";
import { validateRequirements } from "../lib/accessready/validation";
import type { Clinic, MatchResponse } from "../lib/accessready/types";
import { REQUIREMENT_IDS } from "../lib/accessready/types";

function request(body: unknown): Request {
  return new Request("http://localhost/api/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("all confirmed requirements produce READY", () => {
  const result = matchClinic(clinics[1], ["accessible_entrance", "transfer_lift"]);
  assert.equal(result.status, "READY");
  assert.equal(result.confirmedCount, 2);
  assert.deepEqual(result.verificationQuestions, []);
});

test("one unavailable produces NOT_READY and a verification question", () => {
  const result = matchClinic(clinics[2], ["transfer_lift"]);
  assert.equal(result.status, "NOT_READY");
  assert.equal(result.unavailableCount, 1);
  assert.equal(result.verificationQuestions.length, 1);
});

test("one unknown produces NEEDS_VERIFICATION and never counts as confirmed", () => {
  const result = matchClinic(clinics[0], ["transfer_lift"]);
  assert.equal(result.status, "NEEDS_VERIFICATION");
  assert.equal(result.confirmedCount, 0);
  assert.equal(result.unknownCount, 1);
  assert.equal(result.verificationQuestions.length, 1);
});

test("unavailable takes precedence over unknown; both generate questions", () => {
  const result = matchClinic(clinics[0], ["transfer_lift", "quiet_waiting_area"]);
  assert.equal(result.status, "NOT_READY");
  assert.equal(result.unknownCount, 1);
  assert.equal(result.unavailableCount, 1);
  assert.equal(result.verificationQuestions.length, 2);
});

test("empty requirements produce INCOMPLETE for every clinic", async () => {
  const response = await POST(request({ requirements: [] }));
  assert.equal(response.status, 200);
  const body = await response.json() as MatchResponse;
  assert.equal(body.results.length, 3);
  for (const result of body.results) {
    assert.equal(result.status, "INCOMPLETE");
    assert.equal(result.confirmedCount + result.unavailableCount + result.unknownCount, 0);
    assert.deepEqual(result.checks, []);
    assert.deepEqual(result.verificationQuestions, []);
  }
});

test("invalid requirement IDs produce a clear 400 error without echoing input", async () => {
  const response = await POST(request({ requirements: ["private-health-text"] }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.error, /Invalid requirement ID/);
  assert.equal(body.error.includes("private-health-text"), false);
});

test("duplicate requirements are deduplicated in validation and matching", async () => {
  assert.deepEqual(validateRequirements({ requirements: ["transfer_lift", "transfer_lift"] }), ["transfer_lift"]);
  assert.equal(matchClinic(clinics[1], ["transfer_lift", "transfer_lift"]).confirmedCount, 1);
  const response = await POST(request({ requirements: ["transfer_lift", "transfer_lift"] }));
  const body = await response.json() as MatchResponse;
  assert.ok(body.results.every((result) => result.checks.length === 1));
});

test("missing clinic capabilities default to UNKNOWN", () => {
  const clinic: Clinic = { id: "missing", name: "Missing demo", description: "Fictional", capabilities: {} };
  const result = matchClinic(clinic, ["adjustable_exam_table"]);
  assert.equal(result.status, "NEEDS_VERIFICATION");
  assert.equal(result.checks[0].status, "UNKNOWN");
  assert.equal(result.confirmedCount, 0);
});

test("multiple clinic comparison returns all clinics and accurate counts", async () => {
  const response = await POST(request({ requirements: ["accessible_entrance", "transfer_lift"] }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const body = await response.json() as MatchResponse;
  assert.equal(body.synthetic, true);
  assert.equal(body.results.length, 3);
  assert.deepEqual(body.results.map((result) => result.clinicId), ["clinic-2", "clinic-1", "clinic-3"]);
  for (const result of body.results) {
    assert.equal(result.confirmedCount + result.unavailableCount + result.unknownCount, 2);
    assert.ok(result.checks.every((check) => check.explanation.length > 0));
  }
});

test("ranking puts READY before NEEDS_VERIFICATION before NOT_READY", () => {
  const results = matchClinics([...clinics].reverse(), ["transfer_lift"]);
  assert.deepEqual(results.map((result) => result.status), ["READY", "NEEDS_VERIFICATION", "NOT_READY"]);
});

test("matching is deterministic, stable on ties, and does not mutate input", () => {
  const before = JSON.stringify(clinics);
  const requirements = ["accessible_entrance"] as const;
  const first = matchClinics(clinics, requirements);
  assert.deepEqual(first, matchClinics(clinics, requirements));
  assert.deepEqual(first.map((result) => result.clinicId), clinics.map((clinic) => clinic.id));
  assert.equal(JSON.stringify(clinics), before);
});

test("malformed JSON returns 400", async () => {
  const response = await POST(new Request("http://localhost/api/match", { method: "POST", body: "{" }));
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /valid JSON/);
});

test("invalid body shapes and non-string entries return 400", async () => {
  for (const body of [null, [], {}, "text", { requirements: null }, { requirements: "transfer_lift" }, { requirements: [1] }, { requirements: [null] }, { requirements: [{}] }]) {
    const response = await POST(request(body));
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, "string");
  }
});

test("GET clinics returns exactly three fictional records with six capabilities each", async () => {
  const response = GET();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.synthetic, true);
  assert.equal(body.clinics.length, 3);
  assert.equal(new Set(body.clinics.map((clinic: Clinic) => clinic.id)).size, 3);
  for (const clinic of body.clinics) {
    assert.match(clinic.description, /Fictional/);
    assert.equal(Object.keys(clinic.capabilities).length, 6);
  }
});

test("unexpected matching errors return a generic 500 without exposing details", async () => {
  const failingBody = Object.defineProperty({}, "requirements", {
    get() { throw new Error("sensitive internal information"); },
  });
  const response = await POST({ json: async () => failingBody } as Request);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "Unable to compare demonstration clinics." });
});

test("sparse requirements and inherited requirements are rejected", () => {
  assert.throws(() => validateRequirements({ requirements: new Array(2) }));
  assert.throws(() => validateRequirements(Object.create({ requirements: ["transfer_lift"] })));
});

test("IDs must match exactly; unsupported and prototype-like IDs return 400", async () => {
  for (const id of ["", "TRANSFER_LIFT", "transfer_lift ", "__proto__", "constructor", "toString"]) {
    const response = await POST(request({ requirements: [id] }));
    assert.equal(response.status, 400);
  }
});

test("deduplication preserves first-occurrence order and does not mutate requirements", () => {
  const requirements = ["transfer_lift", "accessible_entrance", "transfer_lift"];
  assert.deepEqual(validateRequirements({ requirements }), ["transfer_lift", "accessible_entrance"]);
  assert.deepEqual(requirements, ["transfer_lift", "accessible_entrance", "transfer_lift"]);
});

test("inherited and corrupt capability entries remain UNKNOWN", () => {
  const inherited: Clinic = {
    id: "inherited", name: "Fictional demo", description: "Fictional",
    capabilities: Object.create({ transfer_lift: "CONFIRMED" }),
  };
  assert.equal(matchClinic(inherited, ["transfer_lift"]).status, "NEEDS_VERIFICATION");
  for (const value of [null, "YES", true]) {
    const corrupt = {
      ...inherited, capabilities: { transfer_lift: value },
    } as unknown as Clinic;
    const result = matchClinic(corrupt, ["transfer_lift"]);
    assert.equal(result.unknownCount, 1);
    assert.equal(result.checks[0].status, "UNKNOWN");
  }
});

test("a mandatory unavailable feature cannot be offset by five confirmed features", () => {
  const clinic: Clinic = {
    id: "mandatory", name: "Fictional demo", description: "Fictional",
    capabilities: Object.fromEntries(REQUIREMENT_IDS.map((id) => [
      id, id === "transfer_lift" ? "UNAVAILABLE" : "CONFIRMED",
    ])),
  };
  const result = matchClinic(clinic, REQUIREMENT_IDS);
  assert.equal(result.status, "NOT_READY");
  assert.equal(result.confirmedCount, 5);
  assert.equal(result.unavailableCount, 1);
});

test("all 64 requirement subsets obey status, count, question, and ranking invariants", () => {
  const ranks = { READY: 0, NEEDS_VERIFICATION: 1, NOT_READY: 2, INCOMPLETE: 3 };
  for (let mask = 0; mask < 64; mask++) {
    const requirements = REQUIREMENT_IDS.filter((_, index) => mask & (1 << index));
    const results = matchClinics(clinics, requirements);
    assert.equal(results.length, clinics.length);
    assert.deepEqual(results, matchClinics(clinics, [...requirements].reverse()).map((result) => ({
      ...result,
      checks: [...result.checks].reverse(),
      verificationQuestions: [...result.verificationQuestions].reverse(),
    })));
    for (const [index, result] of results.entries()) {
      assert.equal(result.confirmedCount + result.unavailableCount + result.unknownCount, requirements.length);
      assert.equal(result.verificationQuestions.length, result.unavailableCount + result.unknownCount);
      assert.equal(result.status,
        requirements.length === 0 ? "INCOMPLETE"
          : result.unavailableCount > 0 ? "NOT_READY"
            : result.unknownCount > 0 ? "NEEDS_VERIFICATION" : "READY");
      if (index > 0) assert.ok(ranks[results[index - 1].status] <= ranks[result.status]);
    }
  }
});

test("clinic endpoint responses do not expose mutable data across requests", async () => {
  const first = await GET().json();
  first.clinics[0].capabilities.transfer_lift = "CONFIRMED";
  const response = GET();
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  const second = await response.json();
  assert.equal(second.clinics[0].capabilities.transfer_lift, "UNKNOWN");
});
