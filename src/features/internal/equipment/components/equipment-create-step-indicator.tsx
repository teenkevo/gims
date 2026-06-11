import { Check } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EQUIPMENT_CREATE_STEPS } from "./equipment-form-types";

export function EquipmentCreateStepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  const activeStep = EQUIPMENT_CREATE_STEPS[currentStep - 1];
  const progressValue = (currentStep / EQUIPMENT_CREATE_STEPS.length) * 100;

  return (
    <div className="rounded-xl border border-primary/20 bg-muted/40 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Register Equipment
          </p>
          <h1 className="text-lg md:text-xl font-semibold tracking-tight mt-1">
            {activeStep.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {activeStep.description}
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground shrink-0 mt-2 sm:mt-0">
          Step {currentStep} of {EQUIPMENT_CREATE_STEPS.length}
        </p>
      </div>

      <Progress value={progressValue} className="h-1.5 mb-6" />

      <ol className="hidden md:flex items-center w-full">
        {EQUIPMENT_CREATE_STEPS.map((step, index) => {
          const isActive = step.step === currentStep;
          const isComplete = step.step < currentStep;

          return (
            <li
              key={step.step}
              className={cn(
                "flex items-center",
                index < EQUIPMENT_CREATE_STEPS.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-2 min-w-[7rem]">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isActive &&
                      "border-primary bg-primary text-primary-foreground shadow-sm",
                    isComplete &&
                      "border-primary bg-primary/15 text-primary",
                    !isActive &&
                      !isComplete &&
                      "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    step.step
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center leading-tight max-w-[8rem]",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < EQUIPMENT_CREATE_STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 rounded-full transition-colors",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="flex md:hidden items-center justify-center gap-2">
        {EQUIPMENT_CREATE_STEPS.map((step) => {
          const isActive = step.step === currentStep;
          const isComplete = step.step < currentStep;

          return (
            <div
              key={step.step}
              className={cn(
                "h-2 rounded-full transition-all",
                isActive ? "w-8 bg-primary" : "w-2",
                isComplete && !isActive && "bg-primary/50",
                !isActive && !isComplete && "bg-border"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
