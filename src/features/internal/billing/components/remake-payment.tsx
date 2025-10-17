"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Wallet } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import FileUpload from "@/components/file-upload";
import { NumericFormat } from "react-number-format";
import { FormSubmitButton } from "@/components/form-submit-button";
import { makeResubmission } from "@/lib/actions";
import type { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { WarningOutlineIcon } from "@sanity/icons";

type PaymentFormData = {
  amount: string;
  paymentMode: "mobile_money" | "bank_transfer" | "cash";

  paymentProof: File[];
  paymentType: PaymentType;
};

type PaymentType = "advance" | "full" | "other";

type Quotation = NonNullable<PROJECT_BY_ID_QUERYResult[number]["quotation"]>;
export type Payments = NonNullable<Quotation["payments"]>;

export function RemakePaymentDialog({
  quotationId,
  currency,
  rejectedPayment,
}: {
  quotationId: string;
  currency: string;
  rejectedPayment: Payments[number];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [state, dispatch, isPending] = useActionState(makeResubmission, null);

  const form = useForm<PaymentFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      amount: rejectedPayment.amount?.toString() || "",
      paymentMode: undefined,
      paymentProof: [],
    },
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      form.reset();
      form.setValue("amount", rejectedPayment.amount?.toString() || "");
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    const formData = new FormData();
    formData.append("quotationId", quotationId as string);
    formData.append("amount", data.amount);
    formData.append("currency", currency);
    formData.append("paymentMode", data.paymentMode);
    formData.append("paymentType", "other");
    formData.append("paymentKey", rejectedPayment._key);

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
      toast.success("Payment has been resubmitted successfully");
      setOpen(false);
      form.reset();
      form.setValue("amount", rejectedPayment.amount?.toString() || "");
    } else if (state?.status === "error") {
      toast.error("Something went wrong");
    }
  }, [state, form, rejectedPayment]);

  const isMobile = useMediaQuery("(max-width: 640px)");

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="space-y-2">
          <FormLabel>Payment Type</FormLabel>
          <div className="flex items-center gap-2 px-3 py-2 border border-dotted rounded-md bg-muted/50">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Resubmission of {currency.toUpperCase()}{" "}
              {rejectedPayment.amount?.toLocaleString()}
            </span>
          </div>
        </div>

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
              if (numValue <= 0) {
                return "Amount must be greater than 0";
              }
              return true;
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Payment Amount</FormLabel>
              <FormDescription className="text-xs">
                Resubmitting payment for:{" "}
                <span className="font-bold text-primary">
                  {currency.toUpperCase()}{" "}
                  {rejectedPayment.amount?.toLocaleString()}
                </span>
              </FormDescription>
              <FormControl>
                <NumericFormat
                  autoFocus
                  customInput={Input}
                  thousandSeparator={true}
                  prefix={`${currency.toUpperCase()} `}
                  placeholder={`e.g. ${currency.toUpperCase()} 20,000`}
                  value={field.value}
                  disabled={true}
                  onValueChange={(target) => {
                    field.onChange(target.floatValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
              <FormLabel className="mb-1">Payment Proof</FormLabel>
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
          text="Resubmit Payment"
          isSubmitting={isPending || loading}
        />
      </form>
    </Form>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="destructive" size="sm">
          <WarningOutlineIcon className="h-4 w-4 mr-2" />
          Review and resubmit
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Resubmit Payment</DrawerTitle>
          <DrawerDescription className="text-xs">
            Resubmitting payment of{" "}
            <span className="font-bold text-primary">
              {currency.toUpperCase()}{" "}
              {rejectedPayment.amount?.toLocaleString()}
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
        <Button variant="destructive" size="sm">
          <WarningOutlineIcon className="h-4 w-4 mr-2" />
          Review and resubmit
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="max-w-md flex flex-col max-h-[600px]"
      >
        <DialogHeader>
          <DialogTitle>Resubmit Payment</DialogTitle>
          <DialogDescription className="text-xs">
            Resubmitting payment of{" "}
            <span className="font-bold text-primary">
              {currency.toUpperCase()}{" "}
              {rejectedPayment.amount?.toLocaleString()}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-1">{formContent}</div>
      </DialogContent>
    </Dialog>
  );
}
