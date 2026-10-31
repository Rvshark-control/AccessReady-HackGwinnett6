"use client";

import { useEffect, useState } from "react";
import { useProfile } from "@/components/profile-provider";
import type { Clinic, ClinicsResponse, MatchResponse, MatchResult } from "./accessready/types";
import { apiPath } from "./api-path";

export function useMatches() {
  const { requirements, ready } = useProfile();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [resolvedKey, setResolvedKey] = useState("");
  const profileKey = JSON.stringify(requirements);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    setError("");
    async function load() {
      try {
        const [clinicResponse, matchResponse] = await Promise.all([
          fetch(apiPath("/api/clinics"), { signal: controller.signal }),
          fetch(apiPath("/api/match"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requirements: JSON.parse(profileKey) }),
            signal: controller.signal,
          }),
        ]);
        if (!clinicResponse.ok || !matchResponse.ok) throw new Error("The facility service could not complete your request. Please try again.");
        const [catalog, matches]: [ClinicsResponse, MatchResponse] = await Promise.all([clinicResponse.json(), matchResponse.json()]);
        if (active) {
          setClinics(catalog.clinics);
          setResults(matches.results);
          setResolvedKey(profileKey);
        }
      } catch (cause) {
        if (active) {
          setError(controller.signal.aborted ? "The request took too long. Check your connection and try again." : cause instanceof Error ? cause.message : "Unable to load facilities. Please try again.");
        }
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [profileKey, ready, attempt]);
  // Never display an older score beside a newly changed accessibility profile.
  return { clinics, results, loading: loading || !ready || (!error && resolvedKey !== profileKey), error, retry: () => setAttempt((value) => value + 1) };
}
