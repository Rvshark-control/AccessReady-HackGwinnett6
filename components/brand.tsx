import Link from "next/link";

export function Mascot({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 64 72" fill="none" aria-hidden="true" className={className}>
    <path d="M12 54V29C12 15 20 7 32 7s20 8 20 22v30c0 3-3 4-5 2l-5-4-7 7c-2 2-4 2-6 0l-7-7-5 4c-3 2-5 0-5-3v-4Z" fill="#fff" stroke="#163b3c" strokeWidth="2.5" strokeLinejoin="round"/>
    <ellipse cx="25" cy="33" rx="2.5" ry="3.5" fill="#163b3c"/><ellipse cx="40" cy="33" rx="2.5" ry="3.5" fill="#163b3c"/>
    <path d="M29 42q4 5 8 0" stroke="#163b3c" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="20" cy="40" rx="4" ry="2.5" fill="#f5bbb0"/><ellipse cx="45" cy="40" rx="4" ry="2.5" fill="#f5bbb0"/>
    <rect x="25" y="13" width="15" height="12" rx="4" fill="#d7f3e8"/>
    <path d="M32.5 15.5v7m-3.5-3.5h7" stroke="#247b6b" strokeWidth="2.5"/>
    <path d="m48 18 5-8 3 10" fill="#eeab74" stroke="#163b3c" strokeWidth="1.5"/>
  </svg>;
}

export function Brand() {
  return <Link href="/" className="brand" aria-label="AccessReady home">
    <span className="brand-mark"><Mascot /></span>
    <span>Access<span className="text-teal-800">Ready</span><span className="brand-dot">.</span></span>
  </Link>;
}
