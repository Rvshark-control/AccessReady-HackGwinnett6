import type { Metadata } from "next";
import { CompareFacilities } from "@/components/compare-facilities";

export const metadata: Metadata = { title: "Compare facilities" };
export default function ComparePage() { return <CompareFacilities />; }
