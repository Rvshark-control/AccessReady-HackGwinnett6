import { REQUIREMENT_IDS, type RequirementId } from "./types";

export class ValidationError extends Error {}

export function validateRequirements(body: unknown): RequirementId[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ValidationError("Send a JSON object containing a requirements array.");
  }
  const record = body as Record<string, unknown>;
  if (Object.keys(record).some((key) => key !== "requirements")) {
    throw new ValidationError("Only accessibility requirements are accepted. Do not include personal or medical information.");
  }
  if (!Array.isArray(record.requirements)) throw new ValidationError("requirements must be an array.");
  if (record.requirements.length > REQUIREMENT_IDS.length) {
    throw new ValidationError(`Select at most ${REQUIREMENT_IDS.length} requirements.`);
  }
  const values = record.requirements;
  for (const value of values) {
    if (typeof value !== "string" || !REQUIREMENT_IDS.includes(value as RequirementId)) {
      throw new ValidationError("Every requirement must be a recognized accessibility requirement ID.");
    }
  }
  if (new Set(values).size !== values.length) throw new ValidationError("Duplicate requirements are not allowed.");
  return values as RequirementId[];
}
