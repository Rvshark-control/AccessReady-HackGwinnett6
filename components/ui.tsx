import Link from "next/link";
import { Accessibility, AlertCircle, ArrowRight, Check, CheckCircle2, CircleHelp, Ear, Eye, HandHeart, MessageCircle, Minus, ShieldCheck, Sparkles } from "lucide-react";
import type { Category, MatchResult, SupportStatus, Verification } from "@/lib/accessready/types";

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  const Icon = { Mobility: Accessibility, Hearing: Ear, Vision: Eye, Sensory: Sparkles, Communication: MessageCircle }[category];
  return <Icon size={size} aria-hidden="true" />;
}
export function VerificationBadge({ status }: { status: Verification }) {
  const label = { verified: "Verified", "self-reported": "Self-reported", unverified: "Unverified" }[status];
  const Icon = status === "verified" ? ShieldCheck : CircleHelp;
  return <span className={`verification-badge verification-${status}`}><Icon size={14} aria-hidden="true" />{label}<span className="verification-demo"> · demo</span></span>;
}
export function StatusIcon({ status, size = 17 }: { status: SupportStatus; size?: number }) {
  const Icon = status === "supported" ? CheckCircle2 : status === "unsupported" ? Minus : CircleHelp;
  return <Icon size={size} className={`status-${status}`} aria-hidden="true" />;
}
export function StatusLabel({ status }: { status: SupportStatus }) {
  return <span className={`status-label status-${status}`}><StatusIcon status={status} />{{ supported: "Supported", unsupported: "Not supported", unknown: "Needs confirmation" }[status]}</span>;
}
export function Score({ match, large = false }: { match: MatchResult; large?: boolean }) {
  const status = match.score === 100 ? "full" : match.score && match.score >= 50 ? "partial" : "uncertain";
  return <div className={`score ${large ? "score-large" : ""} score-${status}`}>
    {match.score === null ? <HandHeart size={24} aria-hidden="true" /> : <strong>{match.score}<span>%</span></strong>}
    <span>{match.score === null ? "Your needs, your match" : "requirements matched"}</span>
  </div>;
}
export function MatchBreakdown({ match }: { match: MatchResult }) {
  return <div className="match-breakdown">
    <span><Check size={15} aria-hidden="true" /><strong>{match.supported.length}</strong> supported</span>
    <span><Minus size={15} aria-hidden="true" /><strong>{match.unsupported.length}</strong> missing</span>
    <span><CircleHelp size={15} aria-hidden="true" /><strong>{match.unknown.length}</strong> unknown</span>
  </div>;
}
export function LoadingCards() {
  return <div role="status" aria-label="Loading facility matches" className="loading-stack"><span className="sr-only">Finding care that fits your requirements…</span>{[1, 2, 3].map((id) => <div className="skeleton-card" key={id}><div className="skeleton w-2/3 h-6" /><div className="skeleton w-1/2 h-4" /><div className="skeleton w-full h-12" /></div>)}</div>;
}
export function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div role="alert" className="empty-state"><AlertCircle size={30} aria-hidden="true" /><h2>We couldn’t load your matches</h2><p>{message}</p><button className="button" onClick={retry}>Try again <ArrowRight size={16} aria-hidden="true" /></button></div>;
}
export function EmptyProfileNote() {
  return <div className="info-note"><HandHeart size={20} aria-hidden="true" /><p><strong>A match starts with you.</strong> Select your requirements to see compatibility scores. <Link href="/find-care">Update your profile <ArrowRight size={13} aria-hidden="true" /></Link></p></div>;
}
