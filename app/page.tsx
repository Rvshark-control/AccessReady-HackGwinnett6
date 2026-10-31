import Link from "next/link";
import { ArrowDown, ArrowRight, Check, CheckCheck, GitCompareArrows, HeartHandshake, LockKeyhole, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import { CareIllustration } from "@/components/care-illustration";
import { CategoryIcon } from "@/components/ui";
import { Mascot } from "@/components/brand";
import { CATEGORIES } from "@/lib/accessready/requirements";

export default function HomePage() {
  return <>
    <section className="hero-section">
      <div className="page-container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow hero-eyebrow"><span className="little-spark"><Sparkles size={14} aria-hidden="true" /></span> YOUR NEEDS. YOUR CARE. YOUR CHOICE.</span>
          <h1>Care that sees<br />the <em>whole you.</em></h1>
          <p>“Accessible” means something different to everyone.<br className="desktop-break" /> Find healthcare that fits your specific needs,<br className="desktop-break" /> so you can arrive with more confidence.</p>
          <div className="hero-actions"><Link href="/find-care" className="button button-primary">Find Accessible Care <ArrowRight size={18} aria-hidden="true" /></Link><Link href="/find-care?demo=1" className="button button-outline">Try the demo <span className="demo-time">2 min</span></Link></div>
          <div className="hero-assurances"><span><Check size={15} aria-hidden="true" /> No account needed</span><span><Check size={15} aria-hidden="true" /> No diagnosis required</span></div>
        </div>
        <CareIllustration />
      </div>
    </section>
    <section className="needs-strip" aria-label="Accessibility categories"><div className="page-container"><span>Different needs.<br />{" "}<strong>The same right to care.</strong></span><div>{CATEGORIES.map((category) => <Link href="/find-care" key={category}><CategoryIcon category={category} /><span>{category}</span></Link>)}</div></div></section>
    <section className="section page-container" id="how-it-works">
      <div className="section-heading"><div><span className="eyebrow">LESS GUESSWORK. MORE YOU.</span><h2>A clearer path to care.</h2></div><p>Because getting the care you need<br />{" "}shouldn’t start with a dozen phone calls.</p></div>
      <div className="steps-grid">
        {[{ number: "01", icon: SlidersHorizontal, title: "Tell us what helps.", text: "Choose the accommodations that matter to you. An adjustable exam table? A quieter waiting room? You’re in control.", color: "teal" }, { number: "02", icon: HeartHandshake, title: "Find your fit.", text: "Explore facilities matched to your requirements, with a clear view of what’s supported and what needs confirming.", color: "purple" }, { number: "03", icon: GitCompareArrows, title: "Choose with clarity.", text: "Compare your options side by side. See the details that make a difference before taking the next step.", color: "peach" }].map(({ number, icon: Icon, title, text, color }) => <article className="step-card" key={number}><div className="step-top"><span className={`feature-icon color-${color}`}><Icon size={23} aria-hidden="true" /></span><span className="step-number">{number}</span></div><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>
    <section className="principles-section"><div className="page-container principles-grid">
      <div className="principles-copy"><span className="eyebrow">A LABEL ISN’T THE WHOLE STORY</span><h2>Beyond “accessible.”<br /><em>Built around you.</em></h2><p>A ramp is a start. But it doesn’t tell you about the exam table, the interpreter, or the waiting room. We help you see the details that matter.</p><Link href="/about" className="text-link">Get to know AccessReady <ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="principle-list">
        <div><span className="principle-icon"><CheckCheck size={23} aria-hidden="true" /></span><div><h3>Specific needs. Meaningful matches.</h3><p>16 accommodations across five categories. Every selected requirement counts equally.</p></div></div>
        <div><span className="principle-icon"><ShieldCheck size={23} aria-hidden="true" /></span><div><h3>Honest about what we know.</h3><p>Supported, missing, or unknown. Unverified details never become a promise of access.</p></div></div>
        <div><span className="principle-icon"><LockKeyhole size={23} aria-hidden="true" /></span><div><h3>Your needs. No labels required.</h3><p>No account. No medical history. Just the accommodations that help you feel ready.</p></div></div>
      </div>
    </div></section>
    <section className="page-container cta-section"><div className="cta-panel"><div className="cta-mascot"><Mascot /><span>Here for your next step.</span></div><div><span className="eyebrow">LET’S FIND YOUR FIT</span><h2>A little clarity goes a long way.</h2><p>Your needs deserve more than a checkbox.</p></div><Link href="/find-care?demo=1" className="button">Explore the demo <ArrowRight size={18} aria-hidden="true" /></Link></div><p className="demo-footnote"><ArrowDown size={13} aria-hidden="true" /> Explore 12 synthetic facilities. All information and verification statuses are for demonstration.</p></section>
  </>;
}
