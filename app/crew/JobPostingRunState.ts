export type JobPostingRunState = {
  sessionId: string;
  tasks: {
    name: string;
    description: string;
    status: "pending" | "running" | "complete";
    steps: (
      | {
          type: "tool-call";
          log: string;
          toolName: string;
          args: Record<string, unknown>;
          result: string;
        }
      | {
          type: "finish";
          log: string;
          result: string;
        }
    )[];
  }[];
};
