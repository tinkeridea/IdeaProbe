import React, { Suspense } from "react";
import OverviewPage from "@/app/overview/page";

export function generateStaticParams() {
  return [
    { id: "demo-run-001" },
    { id: "proj-study-planner" },
    { id: "proj-agri-iot" },
    { id: "proj-freelance-tax" },
  ];
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="page-container">Loading run {id}...</div>}>
      <OverviewPage />
    </Suspense>
  );
}
