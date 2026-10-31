import type { Category, Requirement, RequirementId } from "./types";

export const CATEGORIES: Category[] = ["Mobility", "Hearing", "Vision", "Sensory", "Communication"];
export const REQUIREMENTS: Requirement[] = [
  { id: "wheelchair_entrance", label: "Wheelchair-accessible entrance", category: "Mobility", description: "A step-free entrance with enough room for a wheelchair." },
  { id: "accessible_parking", label: "Accessible parking", category: "Mobility", description: "Designated spaces with room to get in and out." },
  { id: "elevators", label: "Elevators", category: "Mobility", description: "Wheelchair-accessible elevators to care areas." },
  { id: "adjustable_exam_table", label: "Adjustable-height exam tables", category: "Mobility", description: "Examination tables that lower for easier transfers." },
  { id: "accessible_restroom", label: "Wheelchair-accessible restrooms", category: "Mobility", description: "Space to turn, grab bars, and accessible fixtures." },
  { id: "asl_interpretation", label: "ASL interpretation", category: "Hearing", description: "American Sign Language interpretation, with advance booking if needed." },
  { id: "written_communication", label: "Written communication", category: "Hearing", description: "Staff can communicate using written notes or text." },
  { id: "visual_alerts", label: "Visual alerts", category: "Hearing", description: "Visual cues for appointments and safety announcements." },
  { id: "screen_reader_forms", label: "Screen-reader-compatible forms", category: "Vision", description: "Digital forms designed to work with screen readers." },
  { id: "large_print", label: "Large-print materials", category: "Vision", description: "Health information and forms in large print." },
  { id: "staff_assistance", label: "Staff assistance", category: "Vision", description: "Help with wayfinding and reading information." },
  { id: "quiet_waiting", label: "Quiet waiting areas", category: "Sensory", description: "A separate, quieter space to wait for your appointment." },
  { id: "reduced_lighting", label: "Reduced lighting", category: "Sensory", description: "Adjustable or dimmed lighting in care spaces." },
  { id: "low_stimulation", label: "Low-stimulation environments", category: "Sensory", description: "Care areas with fewer sounds, screens, and distractions." },
  { id: "language_interpretation", label: "Language interpretation", category: "Communication", description: "Spoken-language interpretation, with availability to confirm." },
  { id: "alternative_communication", label: "Alternative communication support", category: "Communication", description: "Support for communication boards and AAC devices." },
];
export const REQUIREMENT_MAP = Object.fromEntries(REQUIREMENTS.map((item) => [item.id, item])) as Record<RequirementId, Requirement>;
export const DEMO_REQUIREMENTS: RequirementId[] = ["wheelchair_entrance", "adjustable_exam_table"];
export const MATCH_METHOD = "Score = verified supported requirements ÷ selected requirements × 100, rounded down. Self-reported, unverified, and unknown support earns no points. Every requirement has equal weight.";
