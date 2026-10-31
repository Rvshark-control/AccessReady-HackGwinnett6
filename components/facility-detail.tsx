"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Clock3, Info, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { useMatches } from "@/lib/use-matches";
import { effectiveStatus } from "@/lib/accessready/match";
import { CATEGORIES, REQUIREMENTS } from "@/lib/accessready/requirements";
import { useProfile } from "./profile-provider";
import { ComparisonButton } from "./facility-card";
import { CategoryIcon, EmptyProfileNote, ErrorState, LoadingCards, MatchBreakdown, Score, StatusLabel, VerificationBadge } from "./ui";

export function FacilityDetail({ id }: { id: string }) {
  const { requirements } = useProfile();
  const { results, loading, error, retry } = useMatches();
  const match = results.find((result) => result.clinic.id === id);
  if (loading) return <div className="page-container section"><LoadingCards /></div>;
  if (error) return <div className="page-container section"><ErrorState message={error} retry={retry} /></div>;
  if (!match) return <div className="page-container section empty-state"><h1>Facility not found</h1><Link href="/find-care" className="button">Explore facilities</Link></div>;
  const { clinic } = match;
  return <div className="page-container detail-page">
    <Link href="/find-care" className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to your matches</Link>
    <div className="facility-detail-heading"><span className={`facility-icon large color-${clinic.color}`}><Building2 size={34} aria-hidden="true" /></span><div><div className="detail-specialty"><span className="eyebrow">{clinic.specialty}</span><VerificationBadge status={clinic.verification} /></div><h1>{clinic.name}</h1><p><MapPin size={15} aria-hidden="true" /> {clinic.location.neighborhood} · Maple Harbor (fictional)</p></div><ComparisonButton id={clinic.id} name={clinic.name} /></div>
    <div className="detail-layout">
      <div>
        <section className="panel personal-match-panel" aria-labelledby="personal-match-title"><div className="panel-heading"><div><span className="eyebrow">BASED ON WHAT MATTERS TO YOU</span><h2 id="personal-match-title">Your accessibility match</h2></div><Link href="/find-care" className="text-link">Edit needs <ArrowRight size={15} aria-hidden="true" /></Link></div>
          {requirements.length ? <><div className="detail-match-summary"><Score match={match} large /><div><h3>{match.score === 100 ? "Your selected needs are supported." : match.unsupported.length ? "A few details deserve a closer look." : "There’s more to confirm."}</h3><p>{match.explanation}</p></div></div><MatchBreakdown match={match} /><div className="selected-checks">{[...match.supported, ...match.unsupported, ...match.unknown].map((check) => <div key={check.requirement}><div><h3>{check.label}</h3><p>{check.explanation}</p></div><StatusLabel status={check.status} /></div>)}</div></> : <EmptyProfileNote />}
        </section>
        <section className="panel accommodations-panel" aria-labelledby="all-accommodations-title"><div className="panel-heading"><div><span className="eyebrow">THE DETAILS MAKE THE DIFFERENCE</span><h2 id="all-accommodations-title">All accommodations</h2></div></div><p className="panel-description">Support below requires verified evidence in this demo. Self-reported information is shown as needing confirmation.</p>
          {CATEGORIES.map((category) => <div className="accommodation-category" key={category}><h3><CategoryIcon category={category} size={20} /> {category}</h3>{REQUIREMENTS.filter((item) => item.category === category).map((item) => {
            const accommodation = clinic.accommodations[item.id];
            return <div className="accommodation-row" key={item.id}><div><h4>{item.label}{requirements.includes(item.id) && <span className="your-need-label">Your need</span>}</h4><p>{accommodation.detail}</p><small>Evidence: {accommodation.verification} · simulated</small></div><StatusLabel status={effectiveStatus(accommodation)} /></div>;
          })}</div>)}
        </section>
      </div>
      <aside className="detail-sidebar" aria-label="Facility details">
        <section className="panel"><h2>A little about this place</h2><p>{clinic.description}</p><div className="contact-list"><div><MapPin size={18} aria-hidden="true" /><p><strong>Address</strong>{clinic.address}<br />{clinic.city}</p></div><div><Clock3 size={18} aria-hidden="true" /><p><strong>Opening hours</strong>{clinic.hours}</p></div><div><Phone size={18} aria-hidden="true" /><p><strong>Demo phone</strong>{clinic.phone}</p></div><div><Mail size={18} aria-hidden="true" /><p><strong>Demo email</strong><span className="break-anywhere">{clinic.email}</span></p></div></div><p className="contact-disclaimer">Fictional contact details. This facility cannot be contacted or booked.</p></section>
        <section className="verification-note"><ShieldCheck size={25} aria-hidden="true" /><h2>Clarity, not a guarantee.</h2><p>“Verified” means verified within our fictional scenario. No real facility has been independently assessed.</p><p className="review-date">Demo review date: October 28, 2026</p><Link href="/about#data" className="text-link">How verification works <ArrowRight size={14} aria-hidden="true" /></Link></section>
        <div className="data-note"><Info size={18} aria-hidden="true" /><p>In real life, confirm equipment availability, interpreter notice periods, and your specific needs before booking.</p></div>
      </aside>
    </div>
  </div>;
}
