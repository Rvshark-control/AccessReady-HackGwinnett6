# AccessReady API

All endpoints are implemented as Next.js App Router route handlers. Responses use JSON. No authentication, secrets, or external database are required. All facility information and verification are synthetic.

## GET /api/health

Returns HTTP 200:

```json
{
  "status": "ok",
  "service": "AccessReady",
  "version": "2.0.0",
  "synthetic": true,
  "facilityCount": 12
}
```

## GET /api/clinics

Optional query parameters can be combined:

| Parameter | Meaning |
| --- | --- |
| `q` | Case-insensitive substring in name, specialty, address, or neighborhood; maximum 100 characters |
| `specialty` | Exact specialty from the dataset |
| `verification` | `verified`, `self-reported`, or `unverified` |
| `id` | Exact facility identifier |

Returns HTTP 200 with `{ "clinics": Clinic[], "total": number, "synthetic": true }`.

Every clinic includes a name, specialty, description, address, fictional city, demo phone/email, hours, location coordinates/neighborhood, overall verification, review date, display color, and all 16 accommodations. Each accommodation has `status`, `verification`, and `detail`. See `lib/accessready/types.ts` for the full shared type.

No search results returns HTTP 200 with an empty array. An unknown `id` returns 404. Invalid verification/specialty filters or overly long searches return 400. Errors use `{ "error": "Readable explanation." }`.

Examples:

```bash
curl http://localhost:3000/api/health
curl 'http://localhost:3000/api/clinics?q=willow'
curl 'http://localhost:3000/api/clinics?specialty=Dental%20care&verification=verified'
```

## POST /api/match

Use `Content-Type: application/json`. The only accepted property is `requirements`: an array of unique, known IDs. No personal or medical information is accepted.

```json
{
  "requirements": ["wheelchair_entrance", "adjustable_exam_table"]
}
```

Supported IDs:

```text
wheelchair_entrance          accessible_parking
elevators                   adjustable_exam_table
accessible_restroom         asl_interpretation
written_communication       visual_alerts
screen_reader_forms         large_print
staff_assistance            quiet_waiting
reduced_lighting            low_stimulation
language_interpretation     alternative_communication
```

Returns HTTP 200:

```typescript
{
  results: Array<{
    clinic: Clinic;
    score: number | null;
    supported: RequirementCheck[];
    unsupported: RequirementCheck[];
    unknown: RequirementCheck[];
    explanation: string;
  }>;
  requirements: RequirementId[];
  synthetic: true;
  method: string;
}
```

Each requirement check includes the ID, readable label, effective support status, evidence level, and explanation. Results are actually calculated on the server from the submitted requirements and bundled facility dataset.

**Scoring:** verified supported count divided by selected count, multiplied by 100 and rounded down. Verified absence is missing. Self-reported/unverified assertions, absent records, and unknown support remain unknown. No selected requirements yields `null`, not 100%. Ties favor fewer confirmed missing requirements, then alphabetical name order.

The API accepts an empty array for unscored browsing. It rejects duplicate/unknown IDs, non-array values, extra fields, malformed JSON, and more than 16 IDs. The body is limited to 4 KB while streaming; missing or misleading content-length headers cannot bypass the limit.

| Status | Meaning |
| --- | --- |
| 200 | Successful matching |
| 400 | Malformed JSON or invalid request |
| 413 | Request body exceeds 4 KB |
| 415 | Unsupported content type |
| 500 | Unexpected processing error |

Match and health responses use `Cache-Control: no-store`.

```bash
curl -X POST http://localhost:3000/api/match \
  -H 'Content-Type: application/json' \
  -d '{"requirements":["wheelchair_entrance","adjustable_exam_table"]}'
```

`score: 100` describes support for the selected needs only within the synthetic scenario. It is not medical advice, real verification, or a guarantee of care.
