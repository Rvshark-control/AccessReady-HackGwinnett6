export const REQUIREMENT_IDS = [
  "accessible_entrance",
  "adjustable_exam_table",
  "transfer_lift",
  "trained_assistance",
  "sign_language_interpreter",
  "quiet_waiting_area",
] as const;

export type RequirementId = (typeof REQUIREMENT_IDS)[number];
export type CapabilityStatus = "CONFIRMED" | "UNAVAILABLE" | "UNKNOWN";
export type ResultStatus = "READY" | "NOT_READY" | "NEEDS_VERIFICATION" | "INCOMPLETE";

export interface Clinic {
  id: string;
  name: string;
  description: string;
  capabilities: Partial<Record<RequirementId, CapabilityStatus>>;
}

export interface RequirementCheck {
  requirement: RequirementId;
  status: CapabilityStatus;
  explanation: string;
}

export interface MatchResult {
  clinicId: string;
  clinicName: string;
  status: ResultStatus;
  confirmedCount: number;
  unavailableCount: number;
  unknownCount: number;
  checks: RequirementCheck[];
  verificationQuestions: string[];
}

export interface ClinicsResponse {
  clinics: Clinic[];
  synthetic: true;
}

export interface MatchRequest {
  requirements: RequirementId[];
}

export interface MatchResponse {
  results: MatchResult[];
  synthetic: true;
}
