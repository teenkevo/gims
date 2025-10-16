import {
  MobilizationService,
  ReportingService,
} from "@/features/customer/services/data/schema";
import { ALL_SERVICES_QUERYResult } from "../../../../sanity.types";

export type BillingItem = {
  price: number;
  quantity: number;
};

export type BillingItemsByCategory = {
  labTests: ALL_SERVICES_QUERYResult;
  fieldTests: ALL_SERVICES_QUERYResult;
  reportingActivities: ReportingService[];
  mobilizationActivities: MobilizationService[];
};

export type BillingData = {
  items: BillingItemsByCategory;
};

function calculateCategoryTotal(items: any[] | undefined): number {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum: number, item: BillingItem) => {
    const price = Number.isFinite(item?.price) ? item.price : 0;
    const quantity = Number.isFinite(item?.quantity) ? item.quantity : 0;
    return sum + price * quantity;
  }, 0);
}

export function computeBillingTotals(
  billingData: BillingData,
  vatPercentage: number
): {
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
} {
  const mobilization = billingData?.items?.mobilizationActivities ?? [];
  const field = billingData?.items?.fieldTests ?? [];
  const lab = billingData?.items?.labTests ?? [];
  const reporting = billingData?.items?.reportingActivities ?? [];

  const subtotal =
    calculateCategoryTotal(mobilization) +
    calculateCategoryTotal(field) +
    calculateCategoryTotal(lab) +
    calculateCategoryTotal(reporting);

  const safeVatPct = Number.isFinite(vatPercentage) ? vatPercentage : 0;
  const vatAmount = Math.round((subtotal * safeVatPct) / 100);
  const totalWithVat = Math.round(subtotal + vatAmount);

  return { subtotal, vatAmount, totalWithVat };
}
