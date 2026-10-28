import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LabApp } from "@/components/lab/LabApp";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

/** Motion prototype for the sliced prism. Dev only unless explicitly enabled. */
export default function LabPage() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_ENABLE_LAB !== "true"
  ) {
    notFound();
  }
  return <LabApp />;
}
