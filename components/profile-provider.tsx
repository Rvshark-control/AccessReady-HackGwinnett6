"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { REQUIREMENT_IDS, type RequirementId } from "@/lib/accessready/types";

const STORAGE_KEY = "accessready-demo-v2";
interface ProfileContextValue {
  requirements: RequirementId[];
  setRequirements: (requirements: RequirementId[]) => void;
  toggleRequirement: (requirement: RequirementId) => void;
  comparison: string[];
  toggleComparison: (id: string) => void;
  clearComparison: () => void;
  ready: boolean;
}
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [requirements, setRequirements] = useState<RequirementId[]>([]);
  const [comparison, setComparison] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null");
      if (stored && typeof stored === "object") {
        if (Array.isArray(stored.requirements)) {
          setRequirements([...new Set<RequirementId>(stored.requirements.filter((id: unknown): id is RequirementId =>
            typeof id === "string" && REQUIREMENT_IDS.includes(id as RequirementId)))]);
        }
        if (Array.isArray(stored.comparison)) {
          setComparison([...new Set<string>(stored.comparison.filter((id: unknown): id is string =>
            typeof id === "string" && /^[a-z-]{1,80}$/.test(id)))].slice(0, 3));
        }
      }
    } catch { /* Storage is optional; the app also works in memory. */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ requirements, comparison })); }
    catch { /* Restricted storage does not block matching. */ }
  }, [requirements, comparison, ready]);
  const toggleRequirement = useCallback((id: RequirementId) => {
    setRequirements((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);
  const toggleComparison = useCallback((id: string) => {
    setComparison((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  }, []);
  return <ProfileContext.Provider value={{ requirements, setRequirements, toggleRequirement, comparison, toggleComparison, clearComparison: () => setComparison([]), ready }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("ProfileProvider is required.");
  return context;
}
