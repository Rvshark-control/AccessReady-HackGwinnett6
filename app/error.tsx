"use client";
import { ErrorState } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="page-container section"><ErrorState message="Something interrupted this page. Please try loading it again." retry={reset} /></div>;
}
