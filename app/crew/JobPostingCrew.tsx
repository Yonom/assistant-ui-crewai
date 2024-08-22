"use client";

import z from "zod";
import { useCallback, useState } from "react";
import { useAssistantTool } from "@assistant-ui/react";
import { JobPostingRunState } from "./JobPostingRunState";
import { makeJobPosting } from "./makeJobPosting";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import crewAILogo from "./crew-logo.png";
import {
  CircleCheckIcon,
  CircleDashedIcon,
  FileIcon,
  LoaderCircleIcon,
  LoaderIcon,
  MousePointerClickIcon,
} from "lucide-react";
import { create } from "zustand";
import { Button } from "@/components/ui/button";

export const JobPostingCrew = () => {
  const [useStore] = useState(() =>
    create(() => null as JobPostingRunState | null)
  );

  useAssistantTool({
    toolName: "create_job_posting",
    description:
      "Help the user create a job posting. First, ask for answers for each of the questions, then call this function.",
    parameters: z.object({
      company_description: z
        .string()
        .describe("What is the company description?"),
      company_domain: z.string().describe("What is the company domain?"),
      hiring_needs: z.string().describe("What are the hiring needs?"),
      specific_benefits: z
        .string()
        .describe("What are specific_benefits you offer?"),
    }),
    execute: async (args) => {
      return makeJobPosting(args, useStore.setState);
    },
    render: useCallback(
      function CreateJobPosting() {
        const state = useStore();
        const [accordionValue, setAccordionValue] = useState<string[]>([]);

        return (
          <div className="border rounded-xl px-6 pt-4 pb-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <Image
                src={crewAILogo}
                alt="crewai logo"
                width={16}
                height={16}
              />
              <p className="font-medium text-md">Job Description Crew</p>

              <div className="flex-grow"></div>

              <Button size="sm">🖇️ View Logs</Button>
            </div>
            {!state && (
              <div className="pt-4 flex gap-2.5 items-center pb-2">
                <LoaderCircleIcon className="animate-spin size-4 text-blue-500" />{" "}
                <p className="text-sm font-medium">Initializing...</p>
              </div>
            )}

            {state && (
              <>
                <Accordion
                  type="multiple"
                  value={accordionValue.concat(
                    state.tasks
                      .filter((t) => t.status === "running")
                      .map((t) => t.name)
                  )}
                  onValueChange={setAccordionValue}
                >
                  {state.tasks.map((task) => {
                    const actions = task.steps.filter(
                      (s) => s.type === "tool-call"
                    );
                    const result = task.steps.find((s) => s.type === "finish");
                    return (
                      <AccordionItem value={task.name} key={task.name}>
                        <AccordionTrigger>
                          <div className="flex gap-2.5 items-center">
                            {task.status === "complete" && (
                              <CircleCheckIcon className="text-green-600 size-4" />
                            )}
                            {task.status === "running" && (
                              <LoaderCircleIcon className="animate-spin size-4 text-blue-500" />
                            )}
                            {task.status === "pending" && (
                              <CircleDashedIcon className="text-gray-600 size-4" />
                            )}
                            <p className="text-sm font-medium">{task.name}</p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-[27px]">
                          <div>
                            <p>{task.description}</p>
                            {actions.length > 0 && (
                              <>
                                <p className="pt-4 text-xs uppercase font-bold">
                                  Actions
                                </p>
                                {actions.map((t) => (
                                  <div
                                    className="pt-2 flex items-center gap-2"
                                    key={t.log}
                                  >
                                    <MousePointerClickIcon className="size-4" />
                                    <p className="text-xs font-medium">
                                      {t.toolName}
                                    </p>
                                  </div>
                                ))}
                              </>
                            )}
                            {task.status === "running" && (
                              <div className="pt-2 flex items-center gap-2">
                                <LoaderIcon className="size-4 animate-[spin_3s_linear_infinite]" />
                                <p className="text-xs font-medium">Think</p>
                              </div>
                            )}
                            {!!result && (
                              <>
                                <p className="pt-4 text-xs uppercase font-bold">
                                  Result
                                </p>
                                <div className="pt-2 flex items-center gap-2">
                                  <FileIcon className="size-4" />
                                  <p className="text-xs font-medium">
                                    Task Output
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </>
            )}
          </div>
        );
      },
      [useStore]
    ),
  });
  return null;
};
