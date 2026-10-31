import Link from "next/link";

export function Mascot({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 64 72" fill="none" aria-hidden="true" className={className}>
    <path d="M12 54V29C12 15 20 7 32 7s20 8 20 22v30c0 3-3 4-5 2l-5-4-7 7c-2 2-4 2-6 0l-7-7-5 4c-3 2-5 0-5-3v-4Z" fill="#f3f4f6" stroke="#a855f7" strokeWidth="2.5" strokeLinejoin="round"/>
    <ellipse cx="25" cy="33" rx="2.5" ry="3.5" fill="#121218"/><ellipse cx="40" cy="33" rx="2.5" ry="3.5" fill="#121218"/>
    <path d="M29 42q4 5 8 0" stroke="#121218" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="20" cy="40" rx="4" ry="2.5" fill="#ffbe86"/><ellipse cx="45" cy="40" rx="4" ry="2.5" fill="#ffbe86"/>
    <rect x="25" y="13" width="15" height="12" rx="4" fill="#142b20"/>
    <path d="M32.5 15.5v7m-3.5-3.5h7" stroke="#22c55e" strokeWidth="2.5"/>
    <path d="m48 18 5-8 3 10" fill="#ff7a00" stroke="#121218" strokeWidth="1.5"/>
  </svg>;
}

export function Brand() {
  return <Link href="/" className="brand" aria-label="AccessReady home">
    <span className="brand-mark"><Mascot /></span>
    <span>Access<span className="text-pumpkin">Ready</span><span className="brand-dot">.</span></span>
  </Link>;
}
