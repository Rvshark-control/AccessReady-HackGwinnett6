"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CircleHelp, MapPin, Search, SearchX, ShieldCheck, Sparkles, X } from "lucide-react";
import { DEMO_REQUIREMENTS, MATCH_METHOD, REQUIREMENT_MAP } from "@/lib/accessready/requirements";
import { useMatches } from "@/lib/use-matches";
import { useProfile } from "./profile-provider";
import { RequirementsSelector } from "./requirements-selector";
import { FacilityCard } from "./facility-card";
import { ErrorState, LoadingCards } from "./ui";
import { Mascot } from "./brand";

export function FindCare() {
  const { requirements, setRequirements, toggleRequirement, ready } = useProfile();
  const searchParams = useSearchParams();
  const demoApplied = useRef(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [verification, setVerification] = useState("");
  const [sort, setSort] = useState("match");
  const [demoActive, setDemoActive] = useState(false);
  const { clinics, results, loading, error, retry } = useMatches();
  useEffect(() => {
    if (ready && searchParams.get("demo") === "1" && !demoApplied.current) {
      demoApplied.current = true;
      setRequirements(DEMO_REQUIREMENTS);
      setDemoActive(true);
    }
  }, [ready, searchParams, setRequirements]);
  const filtered = results.filter(({ clinic }) => {
    const text = `${clinic.name} ${clinic.specialty} ${clinic.address} ${clinic.location.neighborhood}`.toLowerCase();
    return (!query.trim() || text.includes(query.trim().toLowerCase())) && (!specialty || clinic.specialty === specialty) && (!verification || clinic.verification === verification);
  });
  if (sort === "name") filtered.sort((a, b) => a.clinic.name.localeCompare(b.clinic.name));
  const activeFilters = Boolean(query || specialty || verification);
  return <div className="find-page page-container">
    <div className="page-intro"><span className="eyebrow">YOUR NEXT STEP STARTS HERE</span><h1>Let’s find care that <em>fits you.</em></h1><p>Choose what you need. See what’s supported. Feel more prepared.</p></div>
    <div className="find-layout">
      <div className="profile-column"><RequirementsSelector onFind={() => { resultHeading.current?.focus(); resultHeading.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }} /><div className="boo-tip"><Mascot /><p><strong>No need is too small.</strong>The little details can make a big difference to your visit.</p></div></div>
      <section className="results-section" aria-labelledby="results-heading">
        {demoActive && <div className="demo-active-note" role="status"><Sparkles size={20} aria-hidden="true" /><p><strong>Your two-minute demo is ready.</strong> We selected a wheelchair-accessible entrance and adjustable-height exam tables. Open a result, then compare two facilities.</p><button className="icon-button" aria-label="Dismiss demo introduction" onClick={() => setDemoActive(false)}><X size={16} /></button></div>}
        <div className="search-controls"><div className="search-field"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="facility-search">Search facilities, specialties, or neighborhoods</label><input id="facility-search" type="search" maxLength={100} placeholder="Search facilities, specialties, or neighborhoods" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="location-label"><MapPin size={16} aria-hidden="true" /><span>Maple Harbor <small>Demo city</small></span></div></div>
        <div className="filter-row"><div><label className="sr-only" htmlFor="specialty-filter">Specialty</label><select id="specialty-filter" value={specialty} onChange={(event) => setSpecialty(event.target.value)}><option value="">All specialties</option>{[...new Set(clinics.map((clinic) => clinic.specialty))].sort().map((item) => <option key={item} value={item}>{item}</option>)}</select><label className="sr-only" htmlFor="verification-filter">Verification status</label><select id="verification-filter" value={verification} onChange={(event) => setVerification(event.target.value)}><option value="">All verification levels</option><option value="verified">Verified (simulated)</option><option value="self-reported">Self-reported (simulated)</option><option value="unverified">Unverified (simulated)</option></select></div>{activeFilters && <button className="text-button" onClick={() => { setQuery(""); setSpecialty(""); setVerification(""); }}>Clear filters</button>}</div>
        {requirements.length > 0 && <div className="selected-requirements" aria-label="Selected accessibility requirements">{requirements.map((id) => <button key={id} aria-label={`Remove requirement: ${REQUIREMENT_MAP[id].label}`} onClick={() => toggleRequirement(id)}>{REQUIREMENT_MAP[id].label}<X size={12} aria-hidden="true" /></button>)}</div>}
        <div className="results-heading"><div><h2 id="results-heading" ref={resultHeading} tabIndex={-1}>{loading ? "Finding your fit…" : `${filtered.length} ${filtered.length === 1 ? "facility" : "facilities"} to explore`}</h2><p>{requirements.length ? `Matched to your ${requirements.length} selected requirements` : "Select your needs for a personal match"}</p></div><label className="sort-label">Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="match">Best match</option><option value="name">Name A–Z</option></select></label></div>
        <div className="sr-only" role="status" aria-live="polite">{!loading && !error ? `${filtered.length} facilities found. ${requirements.length} requirements selected.` : ""}</div>
        {loading ? <LoadingCards /> : error ? <ErrorState message={error} retry={retry} /> : filtered.length ? <div className="facility-results">{filtered.map((match, index) => <FacilityCard key={match.clinic.id} match={match} rank={sort === "match" ? index : -1} />)}</div> : <div className="empty-state"><SearchX size={32} aria-hidden="true" /><h3>No facilities found</h3><p>Try a different search or clear your filters to explore all 12 demonstration facilities.</p><button className="button" onClick={() => { setQuery(""); setSpecialty(""); setVerification(""); }}>Clear filters <ArrowRight size={16} aria-hidden="true" /></button></div>}
        <details className="matching-explainer"><summary><CircleHelp size={17} aria-hidden="true" /> How are matches calculated?</summary><p>{MATCH_METHOD} Ties favor fewer confirmed missing requirements, then alphabetical order. A score describes the demo data, not care quality or guaranteed availability.</p></details>
        <div className="data-note"><ShieldCheck size={18} aria-hidden="true" /><p>These are synthetic facilities. Verification is simulated. In real life, always confirm accommodations directly before your visit. <Link href="/about#data">About our data <ArrowRight size={12} aria-hidden="true" /></Link></p></div>
      </section>
    </div>
  </div>;
}
