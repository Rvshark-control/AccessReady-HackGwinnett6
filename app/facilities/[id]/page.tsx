import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { clinics } from "@/data/clinics";
import { FacilityDetail } from "@/components/facility-detail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const clinic = clinics.find((item) => item.id === id);
  return { title: clinic ? `${clinic.name} · Demo facility` : "Facility not found" };
}

export default async function FacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!clinics.some((clinic) => clinic.id === id)) notFound();
  return <FacilityDetail id={id} />;
}
