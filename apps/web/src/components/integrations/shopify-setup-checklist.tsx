"use client";

import { CheckCircle2, Circle, CircleAlert } from "lucide-react";
import { Card } from "@usesend/ui/src/card";
import { Progress } from "@usesend/ui/src/progress";
import { cn } from "@usesend/ui/lib/utils";

type SetupStep = {
  id: string;
  label: string;
  description: string;
  status: "complete" | "pending" | "warning";
  tab?: string;
};

export function ShopifySetupChecklist({
  steps,
  onStepClick,
}: {
  steps: SetupStep[];
  onStepClick?: (tab: string) => void;
}) {
  const completedCount = steps.filter((step) => step.status === "complete").length;
  const progress = (completedCount / steps.length) * 100;

  return (
    <Card className="rounded-xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold">Setup progress</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount} of {steps.length} steps complete
          </p>
        </div>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="mt-4 h-2" />
      <ul className="mt-4 space-y-3">
        {steps.map((step) => {
          const Icon =
            step.status === "complete"
              ? CheckCircle2
              : step.status === "warning"
                ? CircleAlert
                : Circle;

          const content = (
            <>
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  step.status === "complete" && "text-green-600",
                  step.status === "warning" && "text-amber-600",
                  step.status === "pending" && "text-muted-foreground",
                )}
              />
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </>
          );

          if (step.tab && onStepClick && step.status !== "complete") {
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepClick(step.tab!)}
                  className="flex w-full items-start gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/60"
                >
                  {content}
                </button>
              </li>
            );
          }

          return (
            <li key={step.id} className="flex items-start gap-3 px-2 py-1.5">
              {content}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
