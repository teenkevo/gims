"use client";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { GenerateBillingDocument } from "./generate-billing-document";
import ValidityChecker from "./validity-checker";
import {
  ALL_SERVICES_QUERYResult,
  PROJECT_BY_ID_QUERYResult,
} from "../../../../../sanity.types";
import { ActivityValue } from "./mobilization-and-reporting/Activity";
import { ActivityManager } from "./mobilization-and-reporting/activity-manager";
import { DataTable } from "./billable-services/data-table";
import { columns } from "./billable-services/columns";
import { CurrencyToggle } from "./currency-toggle";
import PaymentNotes from "./payment-notes";
import VATToggle from "./vat";

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
  setMobilizationActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
  reportingActivities: { activity: string; price: number; quantity: number }[];
  setReportingActivities: Dispatch<
    SetStateAction<{ activity: string; price: number; quantity: number }[]>
  >;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

// TODO: work on toggle state upon changing tabs
const quotationOptionsSchema = z.object({
  mobilization: z.boolean().default(false).optional(),
  field: z.boolean().default(false).optional(),
  lab: z.boolean().default(false).optional(),
  reporting: z.boolean().default(false).optional(),
});

type QuotationOptionsValues = z.infer<typeof quotationOptionsSchema>;

type SwitchFieldProps = {
  name: keyof QuotationOptionsValues;
  defaultOn: boolean;
  label: string;
  description: string;
  disabled?: boolean;
  quotationOptionsProps: QuotationOptionsProps;
  currency: string;
  // Quotation Section Validations deciding what's rendered
  handleMobilizationValidationChange: (isValid: boolean) => void;
  handleFieldsValidationChange: (isValid: boolean) => void;
  handleLabTestsValidationChange: (isValid: boolean) => void;
  handleReportingValidationChange: (isValid: boolean) => void;
  // validation states
  isMobilizationValid: boolean;
  isFieldsValid: boolean;
  isLabTestsValid: boolean;
  isReportingValid: boolean;
};

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

  const lab = allServices.filter(
    (service) => service.sampleClass?.name !== "Field"
  );

  const field = allServices.filter(
    (service) => service.sampleClass?.name === "Field"
  );

  const [labTestsTableData, setLabTestsTableData] =
    useState<ALL_SERVICES_QUERYResult>(lab);
  const [fieldTestsTableData, setFieldTestsTableData] =
    useState<ALL_SERVICES_QUERYResult>(field);
  const fieldInvestigationsColumns = useMemo(
    () =>
      columns({
        setTableData: setFieldTestsTableData,
        currency,
        quotation: project.quotation,
      }),
    [setFieldTestsTableData, currency]
  );

  const labInvestigationsColumns = useMemo(
    () =>
      columns({
        setTableData: setLabTestsTableData,
        currency,
        quotation: project.quotation,
      }),
    [setLabTestsTableData, currency]
  );

  // Callbacks for handling activity changes
  const handleMobilizationActivitiesChange = useCallback(
    (activities: Array<Partial<ActivityValue>>) => {
      quotationOptionsProps.setMobilizationActivities(
        activities.map((a) => ({
          activity: a.activity || "",
          price: a.price || 0,
          quantity: a.quantity || 0,
        }))
      );
    },
    []
  );
  const handleReportingActivitiesChange = useCallback(
    (activities: Array<Partial<ActivityValue>>) => {
      quotationOptionsProps.setReportingActivities(
        activities.map((a) => ({
          activity: a.activity || "",
          price: a.price || 0,
          quantity: a.quantity || 0,
        }))
      );
    },
    []
  );

  const form = useForm<QuotationOptionsValues>({
    resolver: zodResolver(quotationOptionsSchema),
    defaultValues: { [name]: defaultOn } as Partial<QuotationOptionsValues>,
  });

  // Determine the validity of the switch field
  const isFieldValid = () => {
    const switchIsOn = form.watch(name);
    switch (name) {
      case "mobilization":
        return switchIsOn ? isMobilizationValid : false;
      case "field":
        return switchIsOn ? isFieldsValid : false;
      case "lab":
        return switchIsOn ? isLabTestsValid : false;
      case "reporting":
        return switchIsOn ? isReportingValid : false;
      default:
        return true;
    }
  };

  // Conditionally apply styles only if the field is on and not valid
  const switchFieldClasses =
    form.watch(name) && !isFieldValid()
      ? "transition-all duration-200 ease-in-out rounded-lg border border-destructive p-1 bg-gradient-to-b from-muted/20 to-muted/40"
      : "transition-all duration-200 ease-in-out rounded-lg border p-1 bg-gradient-to-b from-muted/10 to-muted/20";

  const isSwitchOn = form.watch(name);

  function onSubmit(data: QuotationOptionsValues) {
    console.log(data);
  }

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
                      // Set validity to false when the switch is turned off
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
          {isSwitchOn && (
            <div className="p-4">
              {/* Conditionally show the ValidityChecker based on switch being on */}
              <ValidityChecker isValid={isFieldValid()} />
            </div>
          )}
        </form>
      </Form>

      {/* Render related activities/tables based on switch status */}
      {form.getValues("mobilization") && (
        <ActivityManager
          type="Mobilization"
          onActivitiesChange={handleMobilizationActivitiesChange}
          onValidationChange={handleMobilizationValidationChange}
          currency={currency}
          quotation={quotationOptionsProps.project.quotation}
        />
      )}

      {/* Field Tests */}
      {form.getValues("field") && (
        <DataTable
          setSelectedServices={quotationOptionsProps.setSelectedFieldTests}
          onValidationChange={handleFieldsValidationChange}
          columns={fieldInvestigationsColumns}
          data={fieldTestsTableData}
        />
      )}

      {/* Lab Tests */}
      {form.getValues("lab") && (
        <DataTable
          setSelectedServices={quotationOptionsProps.setSelectedLabTests}
          onValidationChange={handleLabTestsValidationChange}
          columns={labInvestigationsColumns}
          data={labTestsTableData}
        />
      )}

      {/* Reporting */}
      {form.getValues("reporting") && (
        <ActivityManager
          type="Reporting"
          onActivitiesChange={handleReportingActivitiesChange}
          onValidationChange={handleReportingValidationChange}
          currency={currency}
          quotation={quotationOptionsProps.project.quotation}
        />
      )}
    </div>
  );
};

export function QuotationOptions(quotationOptionsProps: QuotationOptionsProps) {
  const {
    project,
    selectedLabTests,
    selectedFieldTests,
    mobilizationActivities,
    reportingActivities,
    setDrawerOpen,
  } = quotationOptionsProps;

  const { quotation } = project;

  const quotationVat = quotation?.vatPercentage;
  const quotationPaymentNotes = quotation?.paymentNotes;
  const quotationHasMobilization = quotation?.otherItems?.some(
    (item) => item.type === "mobilization"
  );
  const quotationHasReporting = quotation?.otherItems?.some(
    (item) => item.type === "reporting"
  );

  const quotationCurrency = quotation?.currency;

  const [isMobilizationValid, setIsMobilizationValid] = useState(false);
  const [isFieldsValid, setIsFieldsValid] = useState(false);
  const [isLabTestsValid, setIsLabTestsValid] = useState(false);
  const [isReportingValid, setIsReportingValid] = useState(false);
  const [currency, setCurrency] = React.useState(
    quotationCurrency?.toLocaleLowerCase() || "ugx"
  );
  const [paymentNotes, setPaymentNotes] = useState(quotationPaymentNotes || "");
  const [notesEnabled, setNotesEnabled] = useState(
    quotationPaymentNotes ? true : false
  );
  const [vatPercentage, setVatPercentage] = useState(quotationVat || "18");
  const [vatEnabled, setVatEnabled] = useState(quotationVat ? true : false);

  const handleMobilizationValidationChange = (isValid: boolean) => {
    setIsMobilizationValid(isValid);
  };

  const handleFieldsValidationChange = (isValid: boolean) => {
    setIsFieldsValid(isValid);
  };

  const handleLabTestsValidationChange = (isValid: boolean) => {
    setIsLabTestsValid(isValid);
  };

  const handleReportingValidationChange = (isValid: boolean) => {
    setIsReportingValid(isValid);
  };

  const mobilizationActivitiesInfo = isMobilizationValid
    ? mobilizationActivities
    : [];

  const labTestsInfo = isLabTestsValid ? selectedLabTests : [];

  const fieldTestsInfo = isFieldsValid ? selectedFieldTests : [];

  const reportingActivitiesInfo = isReportingValid ? reportingActivities : [];

  const date = new Date();
  const year = date.getFullYear();
  const uniqueNumber = `${year}-${Date.now().toString().slice(-6)}${Math.floor(
    Math.random() * 1000
  )
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
    labTests: labTestsInfo as (ALL_SERVICES_QUERYResult[number] & {
      price: number;
      quantity: number;
    })[],
    fieldTests: fieldTestsInfo as (ALL_SERVICES_QUERYResult[number] & {
      price: number;
      quantity: number;
    })[],
    mobilizationActivities: mobilizationActivitiesInfo,
    reportingActivities: reportingActivitiesInfo,
    project,
  };

  return (
    <>
      <div className="space-y-8">
        <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg p-4 md:p-6">
          <CurrencyToggle value={currency} onChange={setCurrency} />
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium tracking-tight">
            Choose the items to add to the client's quotation
          </p>
          <SwitchField
            defaultOn={quotationHasMobilization || false}
            currency={currency}
            handleMobilizationValidationChange={
              handleMobilizationValidationChange
            }
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
          <SwitchField
            defaultOn={Boolean(quotation)}
            currency={currency}
            handleMobilizationValidationChange={
              handleMobilizationValidationChange
            }
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
          <SwitchField
            defaultOn={Boolean(quotation)}
            currency={currency}
            handleMobilizationValidationChange={
              handleMobilizationValidationChange
            }
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
          <SwitchField
            defaultOn={quotationHasReporting || false}
            currency={currency}
            handleMobilizationValidationChange={
              handleMobilizationValidationChange
            }
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
            description="Receive emails about your account activity and security."
          />
          <div className="mt-5 md:mt-0">
            <GenerateBillingDocument
              billingInfo={billingInfo}
              setDrawerOpen={setDrawerOpen}
            />
          </div>
          <p className="text-sm font-medium tracking-tight pt-5">
            Extra options
          </p>
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
    </>
  );
}
