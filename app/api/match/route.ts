import { clinics } from "../../../data/clinics";
import { matchClinics } from "../../../lib/accessready/match";
import type { MatchResponse } from "../../../lib/accessready/types";
import { ValidationError, validateRequirements } from "../../../lib/accessready/validation";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  try {
    const requirements = validateRequirements(body);
    const response: MatchResponse = {
      results: matchClinics(clinics, requirements),
      synthetic: true,
    };
    return Response.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "Unable to compare demonstration clinics." }, { status: 500 });
  }
}
