import { z } from "zod";
import { createProjectSchema } from "./schemas";
import { LucideIcon } from "lucide-react";

export type ProjectStage =
  | "BILLING"
  | "SAMPLING"
  | "TESTING"
  | "ANALYSIS"
  | "REPORTING";

export type Priority = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export interface Project {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  client: Client;
  stagesCompleted: ProjectStage[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface WeeklyGoal {
  id: string;
  startDate: string;
  endDate: string;
  goalAmount: number;
  actualAmount: number;
}

export type ProjectData = z.infer<typeof createProjectSchema>;
