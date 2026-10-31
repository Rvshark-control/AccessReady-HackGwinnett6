import { clinics } from "@/data/clinics";
import type { ClinicsResponse } from "@/lib/accessready/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  try {
    const params = new URL(request.url).searchParams;
    const query = (params.get("q") ?? "").trim().toLowerCase();
    const specialty = params.get("specialty");
    const verification = params.get("verification");
    const id = params.get("id");
    if (query.length > 100) return Response.json({ error: "Search must be 100 characters or fewer." }, { status: 400 });
    if (verification && !["verified", "self-reported", "unverified"].includes(verification)) {
      return Response.json({ error: "Unknown verification filter." }, { status: 400 });
    }
    if (specialty && !clinics.some((clinic) => clinic.specialty === specialty)) {
      return Response.json({ error: "Unknown specialty filter." }, { status: 400 });
    }
    if (id && !clinics.some((clinic) => clinic.id === id)) {
      return Response.json({ error: "This demonstration facility could not be found." }, { status: 404 });
    }
    const filtered = clinics.filter((clinic) =>
      (!id || clinic.id === id)
      && (!query || `${clinic.name} ${clinic.specialty} ${clinic.address} ${clinic.location.neighborhood}`.toLowerCase().includes(query))
      && (!specialty || clinic.specialty === specialty)
      && (!verification || clinic.verification === verification),
    );
    const response: ClinicsResponse = { clinics: filtered, total: filtered.length, synthetic: true };
    return Response.json(response);
  } catch {
    return Response.json({ error: "Unable to load demonstration facilities." }, { status: 500 });
  }
}
