export const REQUIREMENT_IDS = [
  "wheelchair_entrance", "accessible_parking", "elevators", "adjustable_exam_table",
  "accessible_restroom", "asl_interpretation", "written_communication", "visual_alerts",
  "screen_reader_forms", "large_print", "staff_assistance", "quiet_waiting",
  "reduced_lighting", "low_stimulation", "language_interpretation", "alternative_communication",
] as const;

export type RequirementId = (typeof REQUIREMENT_IDS)[number];
export type Category = "Mobility" | "Hearing" | "Vision" | "Sensory" | "Communication";
export type SupportStatus = "supported" | "unsupported" | "unknown";
export type Verification = "verified" | "self-reported" | "unverified";
export interface Requirement { id: RequirementId; label: string; category: Category; description: string }
export interface Accommodation { status: SupportStatus; verification: Verification; detail: string }
export interface Clinic {
  id: string;
  name: string;
  specialty: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: string;
  location: { latitude: number; longitude: number; neighborhood: string };
  verification: Verification;
  reviewedAt: string;
  accommodations: Record<RequirementId, Accommodation>;
  color: "teal" | "purple" | "blue" | "peach";
}
export interface RequirementCheck {
  requirement: RequirementId;
  label: string;
  status: SupportStatus;
  verification: Verification;
  explanation: string;
}
export interface MatchResult {
  clinic: Clinic;
  score: number | null;
  supported: RequirementCheck[];
  unsupported: RequirementCheck[];
  unknown: RequirementCheck[];
  explanation: string;
}
export interface ClinicsResponse { clinics: Clinic[]; total: number; synthetic: true }
export interface MatchResponse {
  results: MatchResult[];
  requirements: RequirementId[];
  synthetic: true;
  method: string;
}
