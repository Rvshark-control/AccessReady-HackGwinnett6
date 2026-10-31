import type { Clinic } from "../lib/accessready/types";

// Fictional demonstration records only; these do not describe real facilities.
export const clinics: readonly Clinic[] = [
  {
    id: "clinic-1",
    name: "Demo Clinic A",
    description: "Fictional demonstration facility with mobility accommodations.",
    capabilities: {
      accessible_entrance: "CONFIRMED",
      adjustable_exam_table: "CONFIRMED",
      transfer_lift: "UNKNOWN",
      trained_assistance: "CONFIRMED",
      sign_language_interpreter: "UNKNOWN",
      quiet_waiting_area: "UNAVAILABLE",
    },
  },
  {
    id: "clinic-2",
    name: "Demo Clinic B",
    description: "Fictional demonstration facility with transfer support.",
    capabilities: {
      accessible_entrance: "CONFIRMED",
      adjustable_exam_table: "CONFIRMED",
      transfer_lift: "CONFIRMED",
      trained_assistance: "CONFIRMED",
      sign_language_interpreter: "UNAVAILABLE",
      quiet_waiting_area: "UNKNOWN",
    },
  },
  {
    id: "clinic-3",
    name: "Demo Clinic C",
    description: "Fictional demonstration facility with communication and sensory accommodations.",
    capabilities: {
      accessible_entrance: "CONFIRMED",
      adjustable_exam_table: "UNKNOWN",
      transfer_lift: "UNAVAILABLE",
      trained_assistance: "UNKNOWN",
      sign_language_interpreter: "CONFIRMED",
      quiet_waiting_area: "CONFIRMED",
    },
  },
];
