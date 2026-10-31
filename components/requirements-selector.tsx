"use client";

import { ArrowRight, ChevronDown, LockKeyhole, RotateCcw, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, REQUIREMENTS } from "@/lib/accessready/requirements";
import { useProfile } from "./profile-provider";
import { CategoryIcon } from "./ui";

export function RequirementsSelector({ onFind }: { onFind: () => void }) {
  const { requirements, toggleRequirement, setRequirements } = useProfile();
  return <aside className="requirements-panel" aria-label="Accessibility profile">
    <div className="profile-heading"><span className="feature-icon color-teal"><SlidersHorizontal size={20} aria-hidden="true" /></span><div><h2>Your accessibility needs</h2><p>What would help you feel ready?</p></div></div>
    <div className="profile-meta"><span>{requirements.length} selected</span><button type="button" className="text-button" disabled={!requirements.length} onClick={() => setRequirements([])}><RotateCcw size={12} aria-hidden="true" /> Reset</button></div>
    <form onSubmit={(event) => { event.preventDefault(); onFind(); }}>
      {CATEGORIES.map((category) => {
        const items = REQUIREMENTS.filter((item) => item.category === category);
        const selectedCount = items.filter((item) => requirements.includes(item.id)).length;
        return <details key={category} className="requirement-category" open={category === "Mobility" ? true : undefined}>
          <summary><CategoryIcon category={category} size={18} /><span>{category}</span>{selectedCount > 0 && <span className="category-count">{selectedCount}<span className="sr-only"> selected</span></span>}<ChevronDown size={16} className="chevron" aria-hidden="true" /></summary>
          <fieldset><legend className="sr-only">{category} requirements</legend>{items.map((item) => <label className={`requirement-option ${requirements.includes(item.id) ? "is-selected" : ""}`} key={item.id}><input type="checkbox" name="requirements" value={item.id} checked={requirements.includes(item.id)} onChange={() => toggleRequirement(item.id)} /><span>{item.label}</span></label>)}</fieldset>
        </details>;
      })}
      <div className="profile-bottom"><button type="submit" className="button w-full">Find care <ArrowRight size={17} aria-hidden="true" /></button><p><LockKeyhole size={13} aria-hidden="true" /> No diagnosis or account needed.</p></div>
    </form>
    <div className="profile-storage-note">Your selections stay in this browser tab when storage is available. Reset anytime.</div>
  </aside>;
}
