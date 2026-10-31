import { REQUIREMENT_MAP } from "./requirements";
import type { Accommodation, Clinic, MatchResult, RequirementCheck, RequirementId, SupportStatus } from "./types";

export function effectiveStatus(accommodation?: Accommodation): SupportStatus {
  if (!accommodation || accommodation.status === "unknown") return "unknown";
  if (accommodation.verification !== "verified") return "unknown";
  return accommodation.status;
}

export function matchClinic(clinic: Clinic, requirements: readonly RequirementId[]): MatchResult {
  const uniqueRequirements = [...new Set(requirements)];
  const supported: RequirementCheck[] = [];
  const unsupported: RequirementCheck[] = [];
  const unknown: RequirementCheck[] = [];
  for (const requirement of uniqueRequirements) {
    const accommodation = clinic.accommodations[requirement];
    const status = effectiveStatus(accommodation);
    const check: RequirementCheck = {
      requirement,
      label: REQUIREMENT_MAP[requirement].label,
      status,
      verification: accommodation?.verification ?? "unverified",
      explanation: accommodation
        ? `${accommodation.detail}${accommodation.status !== "unknown" && accommodation.verification !== "verified" ? " This information is not verified, so it is counted as unknown." : ""}`
        : "No accommodation information has been provided.",
    };
    if (status === "supported") supported.push(check);
    else if (status === "unsupported") unsupported.push(check);
    else unknown.push(check);
  }
  const total = uniqueRequirements.length;
  const score = total ? Math.floor((supported.length / total) * 100) : null;
  const explanation = total
    ? `${supported.length} of ${total} selected requirements have verified support in this demo. ${unsupported.length} ${unsupported.length === 1 ? "is" : "are"} not supported; ${unknown.length} ${unknown.length === 1 ? "needs" : "need"} confirmation.${score === 100 ? " All selected requirements are supported in the synthetic data. This is not a guarantee of care." : " Confirm uncertain accommodations before arranging care."}`
    : "Choose your accessibility requirements to see a personal match. No requirements selected means no compatibility score.";
  return { clinic, score, supported, unsupported, unknown, explanation };
}

export function matchClinics(clinics: readonly Clinic[], requirements: readonly RequirementId[]): MatchResult[] {
  return clinics.map((clinic) => matchClinic(clinic, requirements)).sort((a, b) =>
    (b.score ?? -1) - (a.score ?? -1)
    || a.unsupported.length - b.unsupported.length
    || a.clinic.name.localeCompare(b.clinic.name, "en"),
  );
}
