"use client";
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { GenerateBillingDocument } from "./generate-billing-document";
import ValidityChecker from "./validity-checker";
import { ALL_SERVICES_QUERYResult, PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";
import { ActivityValue } from "./mobilization-and-reporting/Activity";
import { ActivityManager } from "./mobilization-and-reporting/activity-manager";
import { DataTable } from "./billable-services/data-table";
import { columns } from "./billable-services/columns";
import { CurrencyToggle } from "./currency-toggle";
import PaymentNotes from "./payment-notes";
import VATToggle from "./vat";

// -----------------------------------------------------------------------------
// Helper ▸ merge the quotation info into each service BEFORE the UI renders.
// -----------------------------------------------------------------------------
function mergeQuotation(
  services: ALL_SERVICES_QUERYResult,
  quotation?: PROJECT_BY_ID_QUERYResult[number]["quotation"]
) {
  return services.map((svc) => {
    const item = quotation?.items?.find((i) => i.service?._ref === svc._id);
    const selectedMethod = item?.testMethod?.standard?.acronym ?? null;

    return {
      ...svc,
      price: item?.unitPrice ?? undefined,
      quantity: item?.quantity ?? undefined,
      testMethods: svc.testMethods?.map((tm) => ({
        ...tm,
        selected: tm.standard?.acronym === selectedMethod,
      })),
      // TanStack Table will use this to pre‑select a row
      preSelected: Boolean(item),
    } as typeof svc & {
      price?: number;
      quantity?: number;
      preSelected?: boolean;
    };
  });
}

// -----------------------------------------------------------------------------
// Quotation‑options schema and types
// -----------------------------------------------------------------------------
const quotationOptionsSchema = z.object({
  mobilization: z.boolean().default(false).optional(),
  field: z.boolean().default(false).optional(),
  lab: z.boolean().default(false).optional(),
  reporting: z.boolean().default(false).optional(),
});

export type QuotationOptionsValues = z.infer<typeof quotationOptionsSchema>;

// -----------------------------------------------------------------------------
// Switch‑field component
// -----------------------------------------------------------------------------
interface SwitchFieldProps {
  name: keyof QuotationOptionsValues;
  defaultOn: boolean;
  label: string;
  description: string;
  disabled?: boolean;
  quotationOptionsProps: QuotationOptionsProps;
  currency: string;
  // validation plumbing
  handleMobilizationValidationChange: (isValid: boolean) => void;
  handleFieldsValidationChange: (isValid: boolean) => void;
  handleLabTestsValidationChange: (isValid: boolean) => void;
  handleReportingValidationChange: (isValid: boolean) => void;
  isMobilizationValid: boolean;
  isFieldsValid: boolean;
  isLabTestsValid: boolean;
  isReportingValid: boolean;
}

const SwitchField = ({
  name,
  defaultOn = false,
  label,
  description,
  disabled = false,
  quotationOptionsProps,
  currency,
  handleMobilizationValidationChange,
  handleFieldsValidationChange,
  handleLabTestsValidationChange,
  handleReportingValidationChange,
  isMobilizationValid,
  isFieldsValid,
  isLabTestsValid,
  isReportingValid,
}: SwitchFieldProps) => {
  const { project, allServices } = quotationOptionsProps;
  const { quotation } = project;

  /* -------------------------------------------------------------
   *   Derive the table‑data only once (no effect required)
   * -----------------------------------------------------------*/
  const labData = useMemo(() => {
    const labRaw = allServices.filter((svc) => svc.sampleClass?.name !== "Field");
    return mergeQuotation(labRaw, quotation);
  }, [allServices, quotation]);

  const fieldData = useMemo(() => {
    const fieldRaw = allServices.filter((svc) => svc.sampleClass?.name === "Field");
    return mergeQuotation(fieldRaw, quotation);
  }, [allServices, quotation]);

  // The table data is state because the user can edit it later
  const [labTestsTableData, setLabTestsTableData] = useState<ALL_SERVICES_QUERYResult>(labData);
  const [fieldTestsTableData, setFieldTestsTableData] = useState<ALL_SERVICES_QUERYResult>(fieldData);

  // Column definitions (no hooks inside thanks to separate cell components)
  const fieldInvestigationsColumns = useMemo(
    () =>
      columns({
        setTableData: setFieldTestsTableData,
        currency,
      }),
    [setFieldTestsTableData, currency]
  );

  const labInvestigationsColumns = useMemo(
    () =>
      columns({
        setTableData: setLabTestsTableData,
        currency,
      }),
    [setLabTestsTableData, currency]
  );

  // ---------------------------------------------------------------------------
  //   Hooks for this switch
  // ---------------------------------------------------------------------------
  const form = useForm<QuotationOptionsValues>({
    resolver: zodResolver(quotationOptionsSchema),
    defaultValues: { [name]: defaultOn } as Partial<QuotationOptionsValues>,
  });

  const isFieldValid = () => {
    const on = form.watch(name);
    switch (name) {
      case "mobilization":
        return on ? isMobilizationValid : false;
      case "field":
        return on ? isFieldsValid : false;
      case "lab":
        return on ? isLabTestsValid : false;
      case "reporting":
        return on ? isReportingValid : false;
      default:
        return true;
    }
  };

  const switchFieldClasses =
    form.watch(name) && !isFieldValid()
      ? "transition-all duration-200 ease-in-out rounded-lg border border-destructive p-1 bg-gradient-to-b from-muted/20 to-muted/40"
      : "transition-all duration-200 ease-in-out rounded-lg border p-1 bg-gradient-to-b from-muted/10 to-muted/20";

  /* ------------------------------------------------------------------------- */
  //   Activity‑manager callbacks
  /* ------------------------------------------------------------------------- */
  const handleMobilizationActivitiesChange = useCallback((activities: Array<Partial<ActivityValue>>) => {
    quotationOptionsProps.setMobilizationActivities(
      activities.map((a) => ({
        activity: a.activity || "",
        price: a.price || 0,
        quantity: a.quantity || 0,
      }))
    );
  }, []);
  const handleReportingActivitiesChange = useCallback((activities: Array<Partial<ActivityValue>>) => {
    quotationOptionsProps.setReportingActivities(
      activities.map((a) => ({
        activity: a.activity || "",
        price: a.price || 0,
        quantity: a.quantity || 0,
      }))
    );
  }, []);

  function onSubmit(data: QuotationOptionsValues) {
    console.log(data);
  }

  /* ------------------------------------------------------------------------- */
  //   JSX
  /* ------------------------------------------------------------------------- */
  return (
    <div className={switchFieldClasses}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between p-4">
                <div className="space-y-1">
                  <FormLabel className="text-lg">{label}</FormLabel>
                  <FormDescription>{description}</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        switch (name) {
                          case "mobilization":
                            handleMobilizationValidationChange(false);
                            break;
                          case "field":
                            handleFieldsValidationChange(false);
                            break;
                          case "lab":
                            handleLabTestsValidationChange(false);
                            break;
                          case "reporting":
                            handleReportingValidationChange(false);
                            break;
                          default:
                            break;
                        }
                      }
                    }}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {form.watch(name) && (
            <div className="p-4">
              <ValidityChecker isValid={isFieldValid()} />
            </div>
          )}
        </form>
      </Form>

      {/* Mobilization activities */}
      {form.getValues("mobilization") && (
        <ActivityManager
          type="Mobilization"
          onActivitiesChange={handleMobilizationActivitiesChange}
          onValidationChange={handleMobilizationValidationChange}
          currency={currency}
          quotation={quotation}
        />
      )}

      {/* Field investigations */}
      {form.getValues("field") && (
        <DataTable
          setSelectedServices={quotationOptionsProps.setSelectedFieldTests}
          onValidationChange={handleFieldsValidationChange}
          columns={fieldInvestigationsColumns}
          data={fieldTestsTableData}
        />
      )}

      {/* Laboratory tests */}
      {form.getValues("lab") && (
        <DataTable
          setSelectedServices={quotationOptionsProps.setSelectedLabTests}
          onValidationChange={handleLabTestsValidationChange}
          columns={labInvestigationsColumns}
          data={labTestsTableData}
        />
      )}

      {/* Reporting activities */}
      {form.getValues("reporting") && (
        <ActivityManager
          type="Reporting"
          onActivitiesChange={handleReportingActivitiesChange}
          onValidationChange={handleReportingValidationChange}
          currency={currency}
          quotation={quotation}
        />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
//   Parent component (unchanged except for currency default and props pass‑through)
// -----------------------------------------------------------------------------
interface QuotationOptionsProps {
  allServices: ALL_SERVICES_QUERYResult;
  project: PROJECT_BY_ID_QUERYResult[number];
  selectedLabTests: ALL_SERVICES_QUERYResult;
  setSelectedLabTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  selectedFieldTests: ALL_SERVICES_QUERYResult;
  setSelectedFieldTests: Dispatch<SetStateAction<ALL_SERVICES_QUERYResult>>;
  mobilizationActivities: {
    activity: string;
    price: number;
    quantity: number;
  }[];
  setMobilizationActivities: Dispatch<SetStateAction<{ activity: string; price: number; quantity: number }[]>>;
  reportingActivities: { activity: string; price: number; quantity: number }[];
  setReportingActivities: Dispatch<SetStateAction<{ activity: string; price: number; quantity: number }[]>>;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export function QuotationOptions(quotationOptionsProps: QuotationOptionsProps) {
  const { project, selectedLabTests, selectedFieldTests, mobilizationActivities, reportingActivities, setDrawerOpen } =
    quotationOptionsProps;

  const { quotation } = project;

  const quotationVat = quotation?.vatPercentage;
  const quotationPaymentNotes = quotation?.paymentNotes;
  const quotationHasMobilization = quotation?.otherItems?.some((item) => item.type === "mobilization");
  const quotationHasReporting = quotation?.otherItems?.some((item) => item.type === "reporting");
  const quotationCurrency = quotation?.currency;

  // ---------------------------------------------------------------------------
  //   Local state
  // ---------------------------------------------------------------------------
  const [isMobilizationValid, setIsMobilizationValid] = useState(false);
  const [isFieldsValid, setIsFieldsValid] = useState(false);
  const [isLabTestsValid, setIsLabTestsValid] = useState(false);
  const [isReportingValid, setIsReportingValid] = useState(false);
  const [currency, setCurrency] = useState(quotationCurrency?.toLocaleLowerCase() || "ugx");
  const [paymentNotes, setPaymentNotes] = useState(quotationPaymentNotes || "");
  const [notesEnabled, setNotesEnabled] = useState(Boolean(paymentNotes));
  const [vatPercentage, setVatPercentage] = useState(quotationVat || "18");
  const [vatEnabled, setVatEnabled] = useState(Boolean(quotationVat));

  // ---------------------------------------------------------------------------
  //   Validation handlers
  // ---------------------------------------------------------------------------
  const handleMobilizationValidationChange = (v: boolean) => setIsMobilizationValid(v);
  const handleFieldsValidationChange = (v: boolean) => setIsFieldsValid(v);
  const handleLabTestsValidationChange = (v: boolean) => setIsLabTestsValid(v);
  const handleReportingValidationChange = (v: boolean) => setIsReportingValid(v);

  // ---------------------------------------------------------------------------
  //   Derived billing info (unchanged)
  // ---------------------------------------------------------------------------
  const date = new Date();
  const year = date.getFullYear();
  const uniqueNumber = `${year}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

  const billingInfo = {
    revisionNumber: `R${year}-00`,
    quotationNumber: `Q${uniqueNumber}`,
    quotationDate: date.toISOString(),
    acquisitionNumber: `A${uniqueNumber}`,
    currency,
    paymentNotes,
    vatPercentage: Number(vatEnabled ? vatPercentage : "0"),
    labTests: (isLabTestsValid ? selectedLabTests : []) as (ALL_SERVICES_QUERYResult[number] & {
      price: number;
      quantity: number;
    })[],
    fieldTests: (isFieldsValid ? selectedFieldTests : []) as (ALL_SERVICES_QUERYResult[number] & {
      price: number;
      quantity: number;
    })[],
    mobilizationActivities: isMobilizationValid ? mobilizationActivities : [],
    reportingActivities: isReportingValid ? reportingActivities : [],
    project,
  } as const;

  // ---------------------------------------------------------------------------
  //   JSX
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 md:p-6">
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium tracking-tight">Choose the items to add to the client's quotation</p>
        {/* Mobilization */}
        <SwitchField
          defaultOn={Boolean(quotationHasMobilization)}
          currency={currency}
          handleMobilizationValidationChange={handleMobilizationValidationChange}
          handleFieldsValidationChange={handleFieldsValidationChange}
          handleLabTestsValidationChange={handleLabTestsValidationChange}
          handleReportingValidationChange={handleReportingValidationChange}
          isMobilizationValid={isMobilizationValid}
          isFieldsValid={isFieldsValid}
          isLabTestsValid={isLabTestsValid}
          isReportingValid={isReportingValid}
          quotationOptionsProps={quotationOptionsProps}
          name="mobilization"
          label="Mobilization Activities"
          description="Mobilization activities for work to be done outside the laboratory"
        />
        {/* Field investigations */}
        <SwitchField
          defaultOn={Boolean(quotation)}
          currency={currency}
          handleMobilizationValidationChange={handleMobilizationValidationChange}
          handleFieldsValidationChange={handleFieldsValidationChange}
          handleLabTestsValidationChange={handleLabTestsValidationChange}
          handleReportingValidationChange={handleReportingValidationChange}
          isMobilizationValid={isMobilizationValid}
          isFieldsValid={isFieldsValid}
          isLabTestsValid={isLabTestsValid}
          isReportingValid={isReportingValid}
          quotationOptionsProps={quotationOptionsProps}
          name="field"
          label="Field Investigations"
          description="Work to be done in the field"
        />
        {/* Laboratory tests */}
        <SwitchField
          defaultOn={Boolean(quotation)}
          currency={currency}
          handleMobilizationValidationChange={handleMobilizationValidationChange}
          handleFieldsValidationChange={handleFieldsValidationChange}
          handleLabTestsValidationChange={handleLabTestsValidationChange}
          handleReportingValidationChange={handleReportingValidationChange}
          isMobilizationValid={isMobilizationValid}
          isFieldsValid={isFieldsValid}
          isLabTestsValid={isLabTestsValid}
          isReportingValid={isReportingValid}
          quotationOptionsProps={quotationOptionsProps}
          name="lab"
          label="Laboratory Tests"
          description="Investigations to be carried out in the laboratory"
        />
        {/* Reporting */}
        <SwitchField
          defaultOn={Boolean(quotationHasReporting)}
          currency={currency}
          handleMobilizationValidationChange={handleMobilizationValidationChange}
          handleFieldsValidationChange={handleFieldsValidationChange}
          handleLabTestsValidationChange={handleLabTestsValidationChange}
          handleReportingValidationChange={handleReportingValidationChange}
          isMobilizationValid={isMobilizationValid}
          isFieldsValid={isFieldsValid}
          isLabTestsValid={isLabTestsValid}
          isReportingValid={isReportingValid}
          quotationOptionsProps={quotationOptionsProps}
          name="reporting"
          label="Reporting"
          description="Receiving project reports and related correspondence."
        />

        <div className="mt-5 md:mt-0">
          <GenerateBillingDocument billingInfo={billingInfo} setDrawerOpen={setDrawerOpen} />
        </div>
        <p className="text-sm font-medium tracking-tight pt-5">Extra options</p>
        <div className="border justify-end grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 md:p-6">
          <VATToggle
            value={vatPercentage?.toString()}
            onChange={setVatPercentage}
            vatEnabled={vatEnabled}
            setVatEnabled={setVatEnabled}
          />
          <PaymentNotes
            value={paymentNotes}
            onChange={setPaymentNotes}
            notesEnabled={notesEnabled}
            setNotesEnabled={setNotesEnabled}
          />
        </div>
      </div>
    </div>
  );
}
