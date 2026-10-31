import { clinics } from "@/data/clinics";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json({
    status: "ok", service: "AccessReady", version: "2.0.0", synthetic: true, facilityCount: clinics.length,
  }, { headers: { "Cache-Control": "no-store" } });
}
