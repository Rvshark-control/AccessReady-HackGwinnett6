import type { Metadata } from "next";
import { Suspense } from "react";
import { FindCare } from "@/components/find-care";
import { LoadingCards } from "@/components/ui";

export const metadata: Metadata = { title: "Find accessible care" };
export default function FindCarePage() {
  return <Suspense fallback={<div className="page-container section"><LoadingCards /></div>}><FindCare /></Suspense>;
}
