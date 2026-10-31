"use client";

import Link from "next/link";
import { ArrowRight, Building2, GitCompareArrows, Info, Plus, X } from "lucide-react";
import { effectiveStatus } from "@/lib/accessready/match";
import { MATCH_METHOD, REQUIREMENTS } from "@/lib/accessready/requirements";
import { useMatches } from "@/lib/use-matches";
import { useProfile } from "./profile-provider";
import { EmptyProfileNote, ErrorState, LoadingCards, MatchBreakdown, Score, StatusLabel, VerificationBadge } from "./ui";
import { ComparisonButton } from "./facility-card";

export function CompareFacilities() {
  const { comparison, toggleComparison, clearComparison, requirements } = useProfile();
  const { results, loading, error, retry } = useMatches();
  const selected = comparison.map((id) => results.find((match) => match.clinic.id === id)).filter((match) => match !== undefined);
  const displayRequirements = requirements.length ? REQUIREMENTS.filter((item) => requirements.includes(item.id)) : REQUIREMENTS;
  const available = results.filter((match) => !comparison.includes(match.clinic.id));
  return <div className="page-container compare-page">
    <div className="page-intro"><span className="eyebrow">A CLEARER PICTURE, SIDE BY SIDE</span><h1>See what makes <em>the difference.</em></h1><p>Compare up to three facilities against the things that matter to you.</p></div>
    {loading ? <LoadingCards /> : error ? <ErrorState message={error} retry={retry} /> : <>
      {selected.length === 0 ? <div className="empty-state compare-empty"><span className="feature-icon color-purple"><GitCompareArrows size={28} aria-hidden="true" /></span><h2>Your next step, side by side.</h2><p>Add two or three facilities below, or explore your matches first. Your comparison will show supported, missing, and unknown accommodations.</p><Link href="/find-care" className="button">Find your matches <ArrowRight size={17} aria-hidden="true" /></Link></div> : <>
        {!requirements.length && <EmptyProfileNote />}
        <div className="compare-toolbar"><p><strong>{selected.length} of 3 facilities</strong> · {requirements.length ? `${requirements.length} selected requirements` : "All 16 accommodations"}</p><div><Link href="/find-care" className="text-link">Edit needs</Link><button className="text-button" onClick={clearComparison}>Clear comparison</button></div></div>
        {selected.length === 1 && <div className="info-note"><Plus size={20} aria-hidden="true" /><p>Add one more facility below to see the differences side by side.</p></div>}
        <p className="comparison-scroll-hint">Scroll sideways to view every facility.</p>
        <div className="comparison-scroll" tabIndex={0} role="region" aria-label="Facility comparison table; scroll horizontally on small screens">
          <table className="comparison-table"><caption className="sr-only">Comparison of {selected.map((match) => match.clinic.name).join(", ")}. All data and verification are synthetic.</caption>
            <thead><tr><th scope="col"><span className="eyebrow">YOUR CARE, IN FOCUS</span><h2>The details<br />that matter.</h2><p>All data & verification<br />are simulated.</p></th>{selected.map(({ clinic }) => <th scope="col" key={clinic.id}><button className="remove-comparison icon-button" aria-label={`Remove ${clinic.name} from comparison`} onClick={() => toggleComparison(clinic.id)}><X size={17} /></button><span className={`facility-icon color-${clinic.color}`}><Building2 size={25} aria-hidden="true" /></span><span className="specialty-label">{clinic.specialty}</span><h3><Link href={`/facilities/${clinic.id}`}>{clinic.name}</Link></h3><VerificationBadge status={clinic.verification} /></th>)}</tr></thead>
            <tbody><tr className="comparison-score-row"><th scope="row">Your compatibility<span>Verified support only</span></th>{selected.map((match) => <td key={match.clinic.id}><Score match={match} /><MatchBreakdown match={match} /></td>)}</tr>
              {displayRequirements.map((item) => <tr key={item.id}><th scope="row">{item.label}<span>{item.category}</span></th>{selected.map(({ clinic }) => <td key={clinic.id}><StatusLabel status={effectiveStatus(clinic.accommodations[item.id])} /><p>{clinic.accommodations[item.id].detail}</p><small>Evidence: {clinic.accommodations[item.id].verification} · demo</small></td>)}</tr>)}
              <tr><th scope="row">Why this result?</th>{selected.map((match) => <td key={match.clinic.id}><p>{match.explanation}</p></td>)}</tr>
              <tr><th scope="row">Location & contact<span>Fictional details</span></th>{selected.map(({ clinic }) => <td key={clinic.id}><p>{clinic.address}<br />{clinic.city}</p><p>{clinic.phone}</p><Link href={`/facilities/${clinic.id}`} className="text-link">View facility <ArrowRight size={14} aria-hidden="true" /></Link></td>)}</tr>
            </tbody>
          </table>
        </div>
        <div className="matching-method-note"><Info size={19} aria-hidden="true" /><p><strong>Every score has a reason.</strong> {MATCH_METHOD} A perfect score applies only to selected requirements in this synthetic dataset; it does not guarantee care.</p></div>
      </>}
      {selected.length < 3 && <section className="add-comparison-section" aria-labelledby="add-comparison-heading"><div className="section-heading"><div><span className="eyebrow">BUILD YOUR COMPARISON</span><h2 id="add-comparison-heading">Add a facility</h2></div><Link href="/find-care" className="text-link">Explore all matches <ArrowRight size={15} aria-hidden="true" /></Link></div><div className="comparison-picker">{available.map(({ clinic, score }) => <article className="comparison-picker-card" key={clinic.id}><div><span className={`facility-icon color-${clinic.color}`}><Building2 size={20} aria-hidden="true" /></span><div><span className="specialty-label">{clinic.specialty}</span><h3>{clinic.name}</h3>{score !== null && <p>{score}% of your requirements matched</p>}</div></div><ComparisonButton id={clinic.id} name={clinic.name} /></article>)}</div></section>}
    </>}
  </div>;
}
