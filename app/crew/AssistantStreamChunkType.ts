export enum AssistantStreamChunkType {
  Init = "I",
  Step = "S",
  Finish = "F",
}

export type AssistantStreamChunk = {
  [AssistantStreamChunkType.Init]: {
    agentops: {
      sesionId: string;
    };
    tasks: [
      {
        name: string;
        description: string;
      }
    ];
  };
  [AssistantStreamChunkType.Step]: {
    log: string;
    toolName: string;
    args: Record<string, unknown>;
    result: string;
  };
  [AssistantStreamChunkType.Finish]: {
    log: string;
    result: string;
  };
};
