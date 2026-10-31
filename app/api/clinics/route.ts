import { clinics } from "../../../data/clinics";
import type { ClinicsResponse } from "../../../lib/accessready/types";

export function GET(): Response {
  try {
    const body: ClinicsResponse = { clinics: [...clinics], synthetic: true };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to load demonstration clinics." }, { status: 500 });
  }
}
