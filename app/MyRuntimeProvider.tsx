"use client";

import { AssistantRuntimeProvider, useEdgeRuntime } from "@assistant-ui/react";

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtime = useEdgeRuntime({
    api: "/api/chat",
    initialMessages: [
      // {
      //   role: "assistant",
      //   content: [
      //     {
      //       type: "tool-call",
      //       toolName: "create_job_posting",
      //       toolCallId: "1",
      //       args: {
      //         company_description: "This is a company description",
      //         company_domain: "This is a company domain",
      //         hiring_needs: "This is a hiring needs",
      //         specific_benefits: "This is a specific benefits",
      //       },
      //       result: "This is a result",
      //     },
      //   ],
      // },
    ],
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
