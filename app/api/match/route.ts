import { clinics } from "@/data/clinics";
import { matchClinics } from "@/lib/accessready/match";
import { MATCH_METHOD } from "@/lib/accessready/requirements";
import type { MatchResponse } from "@/lib/accessready/types";
import { ValidationError, validateRequirements } from "@/lib/accessready/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return Response.json({ error: "Use Content-Type: application/json." }, { status: 415 });
  }
  try {
    // Limit bytes while reading, including chunked bodies without a content-length.
    const reader = request.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 4096) {
          await reader.cancel();
          return Response.json({ error: "Request body must be 4 KB or smaller." }, { status: 413 });
        }
        chunks.push(value);
      }
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return Response.json({ error: "Request body must contain valid JSON." }, { status: 400 });
    }
    const requirements = validateRequirements(body);
    const response: MatchResponse = {
      results: matchClinics(clinics, requirements),
      requirements,
      synthetic: true,
      method: MATCH_METHOD,
    };
    return Response.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ValidationError) return Response.json({ error: error.message }, { status: 400 });
    return Response.json({ error: "Unable to match demonstration facilities. Please try again." }, { status: 500 });
  }
}
