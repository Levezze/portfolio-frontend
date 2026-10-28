import { LabApp } from "@/components/lab/LabApp";
import { loadResume } from "@/components/lab/profile";
import { API_URL } from "@/lib/api/core/apiUrl";

export default async function Home() {
  return <LabApp resume={await loadResume(API_URL)} />;
}
