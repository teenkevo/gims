import { ALL_PROJECTS_QUERYResult } from "../../../../sanity.types";
import { ProjectStage } from "./types";

export const possibleStages: ProjectStage[] = [
  "BILLING",
  "SAMPLING",
  "TESTING",
  "ANALYSIS",
  "REPORTING",
];

export const getCurrentStageIndex = (
  project: ALL_PROJECTS_QUERYResult[number]
): number => {
  const currentStage = project.stagesCompleted![
    project.stagesCompleted!.length - 1
  ] as ProjectStage;
  return possibleStages.indexOf(currentStage);
};

export function numberToWords(num: number): string {
  if (num === 0) return "Zero";

  const belowTwenty: string[] = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens: string[] = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const thousands: string[] = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
  ];

  // Helper function to convert numbers below 1000 into words
  function helper(n: number): string {
    if (n === 0) return "";
    else if (n < 20) return belowTwenty[n] + " ";
    else if (n < 100)
      return (
        tens[Math.floor(n / 10)] +
        (n % 10 !== 0 ? "-" + belowTwenty[n % 10] : "") +
        " "
      );
    else
      return belowTwenty[Math.floor(n / 100)] + " Hundred " + helper(n % 100);
  }

  let word: string = "";
  let i: number = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      const segment: string = helper(num % 1000).trim();
      if (word.length > 0) {
        word = segment + " " + thousands[i] + ", " + word; // Add comma if there's already a segment
      } else {
        word = segment + " " + thousands[i];
      }
    }
    num = Math.floor(num / 1000);
    i++;
  }

  return word.trim().replace(/,\s*$/, ""); // Remove trailing comma if it exists
}
