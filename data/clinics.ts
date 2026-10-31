import clinicData from "./clinics.json";
import type { Clinic } from "@/lib/accessready/types";

// The committed JSON dataset is bundled into production. No database or network is needed.
export const clinics = clinicData as Clinic[];
