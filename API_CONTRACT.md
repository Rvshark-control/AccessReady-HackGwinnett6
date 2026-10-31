# AccessReady API contract

All clinic records are fictional. Both successful endpoints include `synthetic: true`.
Readiness describes selected requirements in demonstration records and never
guarantees real-world accessibility. Patients should confirm arrangements with
the facility before an appointment.

## GET /api/clinics

Returns HTTP 200 with `{ "clinics": [...], "synthetic": true }`.
Each clinic has `id`, `name`, `description`, and `capabilities`, a map from
requirement IDs to `CONFIRMED`, `UNAVAILABLE`, or `UNKNOWN`.
There are three clinics: `clinic-1`, `clinic-2`, and `clinic-3`.

## POST /api/match

Send JSON with `Content-Type: application/json`:

```json
{ "requirements": ["accessible_entrance", "transfer_lift"] }
```

Supported IDs:

- `accessible_entrance`
- `adjustable_exam_table`
- `transfer_lift`
- `trained_assistance`
- `sign_language_interpreter`
- `quiet_waiting_area`

Returns HTTP 200 with `{ "results": [...], "synthetic": true }`.
Each result contains `clinicId`, `clinicName`, `status`, `confirmedCount`,
`unavailableCount`, `unknownCount`, `checks`, and `verificationQuestions`.
Each check contains `requirement`, `status`, and a plain-language `explanation`.
Unavailable and unknown checks each generate a verification question.

For the example request, result order is:

| Clinic | Status | Confirmed | Unavailable | Unknown |
| --- | --- | --- | --- | --- |
| clinic-2 | READY | 2 | 0 | 0 |
| clinic-1 | NEEDS_VERIFICATION | 1 | 0 | 1 |
| clinic-3 | NOT_READY | 1 | 1 | 0 |

`READY` means all selected requirements are confirmed. `NOT_READY` means at
least one is unavailable. `NEEDS_VERIFICATION` means none are unavailable but at
least one is unknown. An empty array returns all clinics as `INCOMPLETE`, with
zero counts and empty checks/questions. Missing capabilities default to `UNKNOWN`.
Requirements are deduplicated in first-occurrence order.
Every selected requirement is mandatory: confirmed features never compensate
for another selected feature being unavailable or unknown. The contract has no
separate optional/mandatory field. Only explicit supported capability statuses
are trusted; corrupt or inherited entries are treated as unknown.

Results sort by READY, NEEDS_VERIFICATION, NOT_READY, INCOMPLETE; ties preserve
clinic data order. Every successful comparison includes all three clinics.

Malformed JSON, invalid IDs, missing requirements, or a requirements value other
than an array return HTTP 400 with `{ "error": "clear explanation" }`.
Unexpected failures return HTTP 500 with a generic `{ "error": "..." }`.
Handlers do not log submitted data. No authentication, environment variables,
database, or external API is required.
Successful responses use `Cache-Control: no-store`.

## Frontend integration

```ts
const clinicsResponse = await fetch("/api/clinics");
if (!clinicsResponse.ok) throw new Error("Unable to load clinics");
const { clinics } = await clinicsResponse.json();

const matchResponse = await fetch("/api/match", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ requirements: selectedRequirementIds }),
});
const body = await matchResponse.json();
if (!matchResponse.ok) throw new Error(body.error);
const { results } = body;
```

Types are exported from `lib/accessready/types.ts`.
Route handlers live under `app/api`. If the frontend scaffolds with `src/app`,
move both handler directories to `src/app/api` and update their relative imports
to the root `data` and `lib` directories.

## Backend verification

Using the already installed tools, no package configuration changes are needed:

```sh
node --import tsx tests/backend.test.ts
node node_modules/typescript/bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --lib ES2022,DOM --types node --skipLibCheck app/api/clinics/route.ts app/api/match/route.ts tests/backend.test.ts
```

These type-check the backend and tests independently of frontend scaffolding.
Tests exercise route handlers directly with standard Request/Response objects.
They include all 64 subsets of the six requirement IDs, checking ranking,
mandatory-feature precedence, counts, verification questions, and invariance
under requirement reordering.
