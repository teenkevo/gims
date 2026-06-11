import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/button-loading";

interface LabFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
  isNextDisabled?: boolean;
}

export function LabFormNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onPrimaryAction,
  isNextDisabled,
}: LabFormNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex w-full items-center justify-between gap-4 p-4 md:px-10">
        <div className="min-w-0">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition">
            {isSubmitting ? (
              <ButtonLoading />
            ) : (
              <Button
                type="button"
                variant="default"
                disabled={isNextDisabled}
                onClick={onPrimaryAction}
              >
                {isLastStep ? "Register Laboratory" : "Continue"}
                <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
