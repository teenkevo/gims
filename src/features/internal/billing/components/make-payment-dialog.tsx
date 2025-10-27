"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

// Components
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Wallet } from "lucide-react";
import FileUpload from "@/components/file-upload";
import { NumericFormat } from "react-number-format";
import { FormSubmitButton } from "@/components/form-submit-button";
import { makePayment } from "@/lib/actions";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

type PaymentFormData = {
  amount: string;
  paymentMode: "mobile_money" | "bank_transfer" | "cash";
  paymentProof: File[];
  paymentType: PaymentType;
};

type PaymentType = "advance" | "full" | "other";

type Quotation = NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>;
export type Payments = NonNullable<Quotation["payments"]>;

export function MakePaymentDialog({
  quotationId,
  total,
  currency,
  advancePercentage = 60,
  existingPayments = [],
}: {
  quotationId: string;
  currency: string;
  total: number;
  advancePercentage?: number;
  existingPayments?: Payments;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType | null>(null);
  const [state, dispatch, isPending] = useActionState(makePayment, null);

  const hasAdvancePayment = existingPayments.some(
    (payment: any) => payment.paymentType === "advance"
  );

  const isAdvanceRequired = advancePercentage > 0;
  const isAdvanceDisabled = !isAdvanceRequired || hasAdvancePayment;
  const isFullDisabled =
    hasAdvancePayment ||
    (isAdvanceRequired && !hasAdvancePayment) ||
    (!isAdvanceRequired && existingPayments.length > 0);
  const isOtherDisabled = isAdvanceRequired && !hasAdvancePayment;

  const form = useForm<PaymentFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      amount: "",
      paymentMode: undefined,
      paymentProof: [],
    },
  });

  const advanceAmount = (total * advancePercentage) / 100;
  const fullAmount = total;

  // Include pending resubmissions when computing unapproved totals
  const totalUnapprovedPayments = existingPayments.reduce(
    (sum: number, payment: Payments[number]) => {
      const resubmissions = payment.resubmissions ?? [];
      const latestResubmission =
        resubmissions[resubmissions.length - 1] ?? null;

      // If there's a resubmission, check its status
      if (latestResubmission) {
        // If latest resubmission is pending (not approved, not rejected), count it
        if (latestResubmission.internalStatus === "pending") {
          return sum + (latestResubmission.amount || 0);
        }
        // If latest resubmission is approved, it's already counted in approved
        if (latestResubmission.internalStatus === "approved") {
          return sum; // Don't double count
        }
        // If latest resubmission is rejected, check original payment status
        if (payment.internalStatus !== "approved") {
          return sum + (payment.amount || 0);
        }
        return sum;
      }

      // No resubmissions, check original payment status
      if (payment.internalStatus !== "approved") {
        return sum + (payment.amount || 0);
      }

      return sum;
    },
    0
  );

  const totalApprovedAmount = existingPayments.reduce(
    (sum: number, payment: Payments[number]) => {
      const resubmissions = payment.resubmissions ?? [];
      const latestResubmission =
        resubmissions[resubmissions.length - 1] ?? null;

      // If there's a resubmission, check its status
      if (latestResubmission) {
        // Only count if the latest resubmission is approved
        if (latestResubmission.internalStatus === "approved") {
          return sum + (latestResubmission.amount || 0);
        }
        // If latest resubmission is rejected or pending, don't count
        return sum;
      }

      // No resubmissions, check original payment status
      if (payment.internalStatus === "approved") {
        return sum + (payment.amount || 0);
      }

      return sum;
    },
    0
  );
  const remainingAmount = total - totalApprovedAmount - totalUnapprovedPayments;

  const handlePaymentTypeChange = (type: PaymentType) => {
    setPaymentType(type);

    switch (type) {
      case "advance":
        form.setValue("amount", advanceAmount.toString());
        break;
      case "full":
        form.setValue("amount", fullAmount.toString());
        break;
      case "other":
        form.setValue("amount", "");
        break;
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset();
      setPaymentType(null);
      if (isAdvanceRequired && !hasAdvancePayment) {
        setTimeout(() => {
          handlePaymentTypeChange("advance");
        }, 100);
      } else {
        setTimeout(() => {
          handlePaymentTypeChange("other");
        }, 100);
      }
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    if (!paymentType) {
      toast.error("Please select a payment type");
      return;
    }

    const amount = Number.parseFloat(data.amount);
    const maxAllowedAmount = remainingAmount;
    if (paymentType === "other" && amount > maxAllowedAmount) {
      toast.error(
        `Amount cannot exceed the remaining amount of ${currency.toUpperCase()} ${maxAllowedAmount.toLocaleString()}`
      );
      return;
    }

    const formData = new FormData();
    formData.append("quotationId", quotationId as string);
    formData.append("amount", data.amount);
    formData.append("currency", currency);
    formData.append("paymentMode", data.paymentMode);
    formData.append("paymentType", paymentType);

    if (data.paymentProof.length > 0) {
      data.paymentProof.forEach((file) => {
        formData.append("files", file);
      });
    }

    setLoading(true);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    setLoading(false);

    formData.append("paymentProof", result?.files[0]?.fileId);

    formData.delete("files");

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("Payment has been recorded successfully");
      setOpen(false);
      form.reset();
      setPaymentType(null);
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, form]);

  const isMobile = useIsMobile();

  const getButtonText = () => {
    if (isAdvanceRequired && !hasAdvancePayment) {
      return `Pay ${advancePercentage}% Advance`;
    }
    return "Make Payment";
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="space-y-2">
          <FormLabel required>Specify Payment Type</FormLabel>

          <ToggleGroup
            type="single"
            value={paymentType || ""}
            onValueChange={(value) => {
              if (value) handlePaymentTypeChange(value as PaymentType);
            }}
            className={cn(
              "justify-start flex flex-wrap gap-2",
              !paymentType && "ring-1 ring-red-500 rounded-md p-2",
              paymentType &&
                "ring-1 ring-foreground transition-all duration-300 rounded-md p-2"
            )}
          >
            <ToggleGroupItem
              variant="default"
              size="sm"
              value="advance"
              disabled={isAdvanceDisabled}
              aria-label="Pay Advance"
              className={cn(
                "flex items-center gap-1 px-3 py-2 relative border border-dotted",
                paymentType === "advance" && "font-medium",
                isAdvanceDisabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {paymentType === "advance" && !hasAdvancePayment && (
                <Wallet className="w-4 h-4 text-primary absolute left-2 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
              <span
                className={cn(
                  "transition-all duration-300 flex items-center",
                  (paymentType === "advance" || hasAdvancePayment) && "ml-6"
                )}
              >
                ({advancePercentage}%) Advance
                {hasAdvancePayment && <Badge className="ml-2">Sent</Badge>}
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              variant="default"
              size="sm"
              value="full"
              aria-label="Pay in Full"
              disabled={isFullDisabled}
              className={cn(
                "flex items-center gap-1 px-3 py-2 relative border border-dotted",
                paymentType === "full" && "font-medium",
                isFullDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {paymentType === "full" && (
                <Wallet className="w-4 h-4 absolute text-primary left-2 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
              <span
                className={cn(
                  "transition-all duration-300",
                  paymentType === "full" && "ml-6"
                )}
              >
                Full
              </span>
            </ToggleGroupItem>
            <ToggleGroupItem
              variant="default"
              value="other"
              size="sm"
              aria-label="Other"
              disabled={isOtherDisabled}
              className={cn(
                "flex items-center gap-1 px-3 py-2 relative border border-dotted",
                paymentType === "other" && "font-medium",
                isOtherDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {paymentType === "other" && (
                <Wallet className="w-4 h-4 absolute text-primary left-2 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
              <span
                className={cn(
                  "transition-all duration-300",
                  paymentType === "other" && "ml-6"
                )}
              >
                Other
              </span>
            </ToggleGroupItem>
          </ToggleGroup>
          {!paymentType && (
            <p className="text-xs text-red-500">Please select a payment type</p>
          )}
        </div>

        {paymentType && (
          <FormField
            control={form.control}
            name="amount"
            rules={{
              required: "Amount is required",
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: "Enter a valid amount (e.g., 100.50)",
              },
              validate: (value) => {
                const numValue = Number.parseFloat(value);
                const maxAllowedAmount = remainingAmount;
                if (paymentType === "other" && numValue > maxAllowedAmount) {
                  return `Amount cannot exceed the remaining amount of ${currency.toUpperCase()} ${maxAllowedAmount.toLocaleString()}`;
                }
                if (numValue <= 0) {
                  return "Amount must be greater than 0";
                }
                return true;
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Payment Amount</FormLabel>
                {paymentType === "other" && (
                  <FormDescription className="text-xs">
                    Remaining amount:{" "}
                    <span className="font-bold text-primary">
                      {currency.toUpperCase()}{" "}
                      {remainingAmount?.toLocaleString()}
                    </span>
                  </FormDescription>
                )}
                <FormControl>
                  <NumericFormat
                    autoFocus
                    customInput={Input}
                    thousandSeparator={true}
                    prefix={`${currency.toUpperCase()} `}
                    placeholder={`e.g. ${currency.toUpperCase()} 20,000`}
                    value={field.value}
                    disabled={
                      paymentType === "advance" || paymentType === "full"
                    }
                    onValueChange={(target) => {
                      field.onChange(target.floatValue);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="paymentMode"
          rules={{ required: "Payment mode is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Payment Mode</FormLabel>
              <Select
                disabled={isPending || loading}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentProof"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel required className="mb-1">
                Payment Proof
              </FormLabel>
              <FormDescription className="text-xs">
                Please upload a proof of payment
              </FormDescription>
              <FormControl>
                <FileUpload
                  accept=".pdf,.doc,.docx,.txt"
                  maxSize={20}
                  onFilesChange={(files) => {
                    field.onChange(files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormSubmitButton
          text="Submit Payment"
          isSubmitting={isPending || loading}
          disabled={!paymentType || form.watch("paymentProof").length === 0}
        />
      </form>
    </Form>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button size="sm" variant="default">
          <CreditCard className="h-5 w-5 mr-2 " />
          {getButtonText()}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Make Payment</DrawerTitle>
          <DrawerDescription className="text-xs">
            Pending amount:{" "}
            <span className="font-bold text-primary">
              {currency.toUpperCase()} {remainingAmount?.toLocaleString()}
            </span>
            <span className="text-gray-500 ml-2">
              (Total: {currency.toUpperCase()} {total?.toLocaleString()})
            </span>
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0 max-h-[400px] overflow-y-auto">
          {formContent}
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <CreditCard className="h-5 w-5 mr-2" />
          {getButtonText()}
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="max-w-md flex flex-col max-h-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription className="text-xs">
            Pending amount:{" "}
            <span className="font-bold text-primary">
              {currency.toUpperCase()} {remainingAmount?.toLocaleString()}
            </span>
            <span className="text-gray-500 ml-2">
              (Total: {currency.toUpperCase()} {total?.toLocaleString()})
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1">{formContent}</div>
      </DialogContent>
    </Dialog>
  );
}
