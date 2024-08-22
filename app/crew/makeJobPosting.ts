import { streamUtils } from "@assistant-ui/react";
import {
  AssistantStreamChunk,
  AssistantStreamChunkType,
} from "./AssistantStreamChunkType";
import { JobPostingRunState } from "./JobPostingRunState";

export const makeJobPosting = async (
  args: Record<string, unknown>,
  onUpdate: (state: JobPostingRunState) => void
) => {
  const res = await fetch("http://localhost:8000/create_job_posting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  let lastState: JobPostingRunState = {
    sessionId: "",
    tasks: [],
  };
  const setState = (
    callback: (prevState: JobPostingRunState) => JobPostingRunState
  ) => {
    lastState = callback(lastState);
    onUpdate(lastState);
  };

  await res
    .body!.pipeThrough(
      streamUtils.streamPartDecoderStream<AssistantStreamChunk>()
    )
    .pipeTo(
      new WritableStream({
        write({ type, value }) {
          switch (type) {
            case AssistantStreamChunkType.Init:
              setState(() => ({
                sessionId: value.agentops.sesionId,
                tasks: value.tasks.map((task, idx) => ({
                  name: task.name,
                  description: task.description,
                  status: idx === 0 ? "running" : "pending",
                  steps: [],
                })),
              }));
              break;
            case AssistantStreamChunkType.Step:
              setState((prevState) => {
                if (!prevState) return prevState;
                return {
                  ...prevState,
                  tasks: prevState.tasks.map((task) => {
                    if (task.status !== "running") return task;
                    return {
                      ...task,
                      steps: [
                        ...task.steps,
                        {
                          type: "tool-call",
                          log: value.log,
                          toolName: value.toolName,
                          args: value.args,
                          result: value.result,
                        },
                      ],
                    };
                  }),
                };
              });
              break;
            case AssistantStreamChunkType.Finish:
              setState((prevState) => {
                if (!prevState) return prevState;
                let completeIdx = -1;
                return {
                  ...prevState,
                  tasks: prevState.tasks.map((task, idx) => {
                    if (task.status === "pending" && completeIdx === idx - 1) {
                      return {
                        ...task,
                        status: "running",
                      };
                    }
                    if (task.status !== "running") return task;
                    completeIdx = idx;
                    return {
                      ...task,
                      status: "complete",
                      steps: [
                        ...task.steps,
                        {
                          type: "finish",
                          log: value.log,
                          result: value.result,
                        },
                      ],
                    };
                  }),
                };
              });
              break;
          }
        },
      })
    );

  return lastState.tasks.at(-1)?.steps.at(-1)?.result;
};
