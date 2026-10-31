import type { CapabilityStatus, Clinic, MatchResult, RequirementId, ResultStatus } from "./types";

const labels: Record<RequirementId, string> = {
  accessible_entrance: "an accessible entrance",
  adjustable_exam_table: "an adjustable exam table",
  transfer_lift: "a patient transfer lift",
  trained_assistance: "staff trained to provide assistance",
  sign_language_interpreter: "a sign language interpreter",
  quiet_waiting_area: "a quiet waiting area",
};

const rank: Record<ResultStatus, number> = {
  READY: 0,
  NEEDS_VERIFICATION: 1,
  NOT_READY: 2,
  INCOMPLETE: 3,
};

export function matchClinic(
  clinic: Clinic,
  requirements: readonly RequirementId[],
): MatchResult {
  const checks = [...new Set(requirements)].map((requirement) => {
    const recorded = Object.hasOwn(clinic.capabilities, requirement)
      ? clinic.capabilities[requirement]
      : undefined;
    // Only explicit supported statuses are trusted, even if runtime data is corrupt.
    const status: CapabilityStatus = recorded === "CONFIRMED" || recorded === "UNAVAILABLE"
      ? recorded
      : "UNKNOWN";
    const label = labels[requirement];
    const explanation =
      status === "CONFIRMED"
        ? `The demonstration record lists ${label} as confirmed. This is synthetic data; confirm arrangements with the facility before your appointment.`
        : status === "UNAVAILABLE"
          ? `The demonstration record lists ${label} as unavailable. Ask the facility about alternatives before your appointment.`
          : `Availability of ${label} has not been verified. Contact the facility to confirm before your appointment.`;
    return { requirement, status, explanation };
  });
  const confirmedCount = checks.filter((check) => check.status === "CONFIRMED").length;
  const unavailableCount = checks.filter((check) => check.status === "UNAVAILABLE").length;
  const unknownCount = checks.filter((check) => check.status === "UNKNOWN").length;
  const status: ResultStatus =
    checks.length === 0 ? "INCOMPLETE"
      : unavailableCount > 0 ? "NOT_READY"
        : unknownCount > 0 ? "NEEDS_VERIFICATION"
          : "READY";
  return {
    clinicId: clinic.id,
    clinicName: clinic.name,
    status,
    confirmedCount,
    unavailableCount,
    unknownCount,
    checks,
    verificationQuestions: checks
      .filter((check) => check.status !== "CONFIRMED")
      .map((check) =>
        check.status === "UNAVAILABLE"
          ? `The demonstration record lists ${labels[check.requirement]} as unavailable. Can you confirm current availability or an alternative for my appointment?`
          : `Can you confirm whether ${labels[check.requirement]} is available for my appointment?`,
      ),
  };
}

export function matchClinics(
  clinics: readonly Clinic[],
  requirements: readonly RequirementId[],
): MatchResult[] {
  // Stable sorting preserves input clinic order within each readiness category.
  return clinics.map((clinic) => matchClinic(clinic, requirements))
    .sort((a, b) => rank[a.status] - rank[b.status]);
}
