import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Mascot } from "@/components/brand";

export default function NotFound() {
  return <div className="page-container section empty-state"><Mascot className="w-20 h-24" /><span className="eyebrow">A SMALL DETOUR</span><h1>We couldn’t find that page.</h1><p>Let’s get you back on the path to care.</p><Link href="/find-care" className="button">Explore facilities <ArrowRight size={17} aria-hidden="true" /></Link></div>;
}
