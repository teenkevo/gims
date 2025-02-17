"use client";

import { Button } from "@/components/ui/button";
import * as Sentry from "@sentry/nextjs";

const SentryFeedbackButton = () => {
  const openFeedback = () => {
    if (Sentry.showReportDialog) {
      Sentry.showReportDialog();
    } else {
      console.warn("Sentry is not properly initialized.");
    }
  };

  return (
    <Button
      onClick={openFeedback}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      Report an Issue
    </Button>
  );
};

export default SentryFeedbackButton;
