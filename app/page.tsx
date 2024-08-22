import { Thread } from "@assistant-ui/react";
import { JobPostingCrew } from "./crew/JobPostingCrew";

export default function Home() {
  return (
    <main className="h-full">
      <Thread />
      <JobPostingCrew />
    </main>
  );
}
