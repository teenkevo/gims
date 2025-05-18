import { ArrowRightCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonLoading } from "./button-loading";

interface FormSubmitButtonProps {
  isSubmitting?: boolean;
  text: string;
  disabled?: boolean;
}

export function FormSubmitButton({ isSubmitting, text, disabled }: FormSubmitButtonProps) {
  return (
    <div className="fixed rounded-b-lg bottom-0 left-0 w-full p-4 shadow-lg flex justify-end items-center border-t border-dashed bg-background/30 backdrop-blur-md">
      <div className="flex items-center">
        <div className="relative after:pointer-events-none after:absolute after:inset-px after:rounded-[11px] after:shadow-highlight after:shadow-white/10 focus-within:after:shadow-[#77f6aa] after:transition">
          {isSubmitting ? (
            <ButtonLoading />
          ) : (
            <Button type="submit" variant="default" disabled={disabled}>
              {text}
              <ArrowRightCircle className="ml-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
