import { REQUIREMENT_IDS, type RequirementId } from "./types";

export class ValidationError extends Error {}

export function validateRequirements(body: unknown): RequirementId[] {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ValidationError("Request body must be a JSON object containing a requirements array.");
  }
  const requirements = Object.hasOwn(body, "requirements")
    ? (body as Record<string, unknown>).requirements
    : undefined;
  if (!Array.isArray(requirements)) {
    throw new ValidationError("requirements must be an array of supported requirement IDs.");
  }
  const validIds = new Set<string>(REQUIREMENT_IDS);
  if (Array.from(requirements).some((id) => typeof id !== "string" || !validIds.has(id))) {
    // Do not echo arbitrary request data, which could contain health information.
    throw new ValidationError(`Invalid requirement ID. Supported IDs: ${REQUIREMENT_IDS.join(", ")}.`);
  }
  return [...new Set(requirements)] as RequirementId[];
}
