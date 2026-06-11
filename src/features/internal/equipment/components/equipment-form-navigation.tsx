import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonLoading } from "@/components/button-loading";

export function EquipmentFormNavigation({
  currentStep,
  totalSteps,
  isSubmitting,
  onBack,
  onNext,
  isNextDisabled,
}: {
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
}) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex w-full items-center justify-between gap-4 p-4 md:px-10">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
        >
          <ArrowLeftCircle className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Step {currentStep} of {totalSteps}
          </span>
          {isSubmitting ? (
            <ButtonLoading />
          ) : (
            <Button
              type={isLastStep ? "submit" : "button"}
              variant="default"
              disabled={isNextDisabled}
              onClick={isLastStep ? undefined : onNext}
            >
              {isLastStep ? "Register Equipment" : "Continue"}
              <ArrowRightCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
