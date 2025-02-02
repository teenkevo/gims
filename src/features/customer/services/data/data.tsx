import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";

export const test_methods = [
  {
    value: "bs",
    label: "BS",
  },
  {
    value: "astm",
    label: "ASTM",
  },
  {
    value: "aashto",
    label: "AASHTO",
  },
];

export const sample_classes = [
  {
    value: "aggregates",
    label: "Aggregates",
  },
  {
    value: "asphalt",
    label: "Asphalt",
  },
  {
    value: "soil+crr",
    label: "Soil + CRR",
  },
  {
    value: "concrete",
    label: "Concrete",
  },
];

export const statuses = [
  {
    value: "active",
    label: "Active",
    icon: CheckCircledIcon,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    icon: CrossCircledIcon,
  },
];

export const priorities = [
  {
    label: "Low",
    value: "low",
    icon: ArrowDownIcon,
  },
  {
    label: "Medium",
    value: "medium",
    icon: ArrowRightIcon,
  },
  {
    label: "High",
    value: "high",
    icon: ArrowUpIcon,
  },
];
