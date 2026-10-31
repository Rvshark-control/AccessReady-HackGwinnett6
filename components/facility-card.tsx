"use client";

import Link from "next/link";
import { ArrowRight, Building2, MapPin, Plus, Check } from "lucide-react";
import type { MatchResult } from "@/lib/accessready/types";
import { useProfile } from "./profile-provider";
import { MatchBreakdown, Score, StatusIcon, VerificationBadge } from "./ui";

export function ComparisonButton({ id, name }: { id: string; name: string }) {
  const { comparison, toggleComparison } = useProfile();
  const selected = comparison.includes(id);
  const full = comparison.length >= 3 && !selected;
  const label = selected ? `Added to compare: ${name}. Remove from comparison` : full ? `Compare is full (3): ${name}` : `Compare ${name}: add to comparison`;
  return <button type="button" className={`compare-button ${selected ? "is-selected" : ""}`} aria-label={label} aria-pressed={selected} disabled={full} onClick={() => toggleComparison(id)}>{selected ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}{selected ? "Added to compare" : full ? "Compare is full (3)" : "Compare"}</button>;
}

export function FacilityCard({ match, rank }: { match: MatchResult; rank: number }) {
  const { clinic } = match;
  const checks = [...match.supported, ...match.unsupported, ...match.unknown].slice(0, 3);
  return <article className={`facility-card ${rank === 0 && match.score === 100 ? "best-match-card" : ""}`}>
    {rank === 0 && match.score === 100 && <div className="best-match-label"><Check size={13} aria-hidden="true" /> All your selected requirements, supported</div>}
    <div className="facility-card-body">
      <div className="facility-card-top"><span className={`facility-icon color-${clinic.color}`}><Building2 size={25} strokeWidth={1.6} aria-hidden="true" /></span><div className="facility-title"><span className="specialty-label">{clinic.specialty}</span><h3><Link href={`/facilities/${clinic.id}`}>{clinic.name}</Link></h3><p><MapPin size={13} aria-hidden="true" />{clinic.location.neighborhood} · Maple Harbor (fictional)</p></div><Score match={match} /></div>
      <p className="facility-description">{clinic.description}</p>
      {match.score !== null ? <><div className="requirement-chips">{checks.map((check) => <span key={check.requirement}><StatusIcon status={check.status} size={14} />{check.label}</span>)}{match.supported.length + match.unsupported.length + match.unknown.length > 3 && <span>+{match.supported.length + match.unsupported.length + match.unknown.length - 3} more</span>}</div><MatchBreakdown match={match} /></> : <p className="unscored-note">Select your needs to see how this facility fits.</p>}
      <div className="facility-card-footer"><VerificationBadge status={clinic.verification} /><div><ComparisonButton id={clinic.id} name={clinic.name} /><Link href={`/facilities/${clinic.id}`} className="text-link" aria-label={`View details for ${clinic.name}`}>View details <ArrowRight size={16} aria-hidden="true" /></Link></div></div>
    </div>
  </article>;
}
