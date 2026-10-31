"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, GitCompareArrows, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand, Mascot } from "./brand";
import { useProfile } from "./profile-provider";
import { DEMO_REQUIREMENTS } from "@/lib/accessready/requirements";

const navigation = [{ href: "/find-care", label: "Find care" }, { href: "/compare", label: "Compare" }, { href: "/about", label: "Our mission" }];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { comparison, setRequirements } = useProfile();
  return <>
    <div className="demo-banner"><span className="demo-dot" /> A little demo. A more accessible future. <span className="banner-divider">|</span><span>All facilities & verification are synthetic.</span></div>
    <header className="site-header">
      <div className="page-container header-inner">
        <Brand />
        <nav aria-label="Main navigation" className="desktop-nav">
          {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>{item.label}{item.href === "/compare" && comparison.length > 0 && <span className="nav-count">{comparison.length}</span>}</Link>)}
        </nav>
        <Link href="/find-care?demo=1" className="button button-small desktop-demo" onClick={() => setRequirements(DEMO_REQUIREMENTS)}>Try the demo <ArrowRight size={15} aria-hidden="true" /></Link>
        <button type="button" className="icon-button mobile-menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-nav">
        {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
        <Link href="/find-care?demo=1" onClick={() => { setRequirements(DEMO_REQUIREMENTS); setMenuOpen(false); }}>Try the demo <ArrowRight size={16} aria-hidden="true" /></Link>
      </nav>}
    </header>
  </>;
}

export function Footer() {
  return <footer className="site-footer">
    <div className="page-container">
      <div className="footer-top"><div><Brand /><p>Care should fit you.<br />Let’s make that the starting point.</p></div>
        <nav aria-label="Footer navigation"><Link href="/find-care">Find care</Link><Link href="/compare">Compare facilities</Link><Link href="/about">Our mission & data</Link></nav>
        <div className="mascot-note"><Mascot /><div>A little spirit.<br /><strong>A lot of care.</strong><span>Meet Boo, your access advocate.</span></div></div>
      </div>
      <div className="footer-bottom"><span>© 2026 AccessReady. Built with everyone in mind.</span><span><Heart size={13} aria-hidden="true" /> An independent hackathon demo</span></div>
      <p className="footer-disclaimer">Synthetic facilities, addresses, contact details, and simulated verification. This demo does not provide medical advice or appointment booking.</p>
    </div>
  </footer>;
}

export function CompareTray() {
  const { comparison, clearComparison } = useProfile();
  const pathname = usePathname();
  if (!comparison.length || pathname === "/compare" || pathname === "/" || pathname === "/about") return null;
  return <div className="compare-tray" aria-label="Facility comparison selection">
    <div><GitCompareArrows size={20} aria-hidden="true" /><span><strong>{comparison.length} {comparison.length === 1 ? "facility" : "facilities"} selected</strong><small>Choose up to 3 to compare</small></span></div>
    <button className="text-button" onClick={clearComparison}>Clear</button>
    <Link href="/compare" className="button button-small">Compare <ArrowRight size={16} aria-hidden="true" /></Link>
  </div>;
}
