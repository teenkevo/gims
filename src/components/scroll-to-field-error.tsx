import { useEffect } from "react";
import { useFormContext, FieldError } from "react-hook-form";

export const ScrollToFieldError = () => {
  const {
    formState: { errors, isSubmitting },
  } = useFormContext();

  useEffect(() => {
    const error = Object.values(errors)[0] as FieldError;

    if (!(error?.ref instanceof HTMLElement) || isSubmitting) return;

    // To achieve the desired smooth scrolling behavior,
    // make sure to configure the useForm with shouldFocusError set to false.
    error.ref.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    error.ref.focus({ preventScroll: true });
  }, [errors, isSubmitting]);

  return null;
};
