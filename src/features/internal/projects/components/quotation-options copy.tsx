"use client";
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
import { Project } from "../types";
import { Dispatch, SetStateAction, useState } from "react";
import {
  FieldService,
  MobilizationService,
  ReportingService,
  Service,
} from "@/features/customer/services/data/schema";
import { Activity } from "./services-table/Activity";
import { DataTableFieldTests } from "./services-table/data-table-field-tests";
import { DataTableLabTests } from "./services-table/data-table-lab-tests";
import { GenerateBillingDocument } from "./generate-billing-document";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Loader } from "lucide-react";
import ValidityChecker from "./services-table/validity-checker";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../sanity.types";

interface QuotationOptionsProps {
  project: PROJECT_BY_ID_QUERYResult[number];
  coreFieldRowSelection: {};
  setCoreFieldRowSelection: Dispatch<SetStateAction<{}>>;
  coreLabRowSelection: {};
  setCoreLabRowSelection: Dispatch<SetStateAction<{}>>;
  labTestsTableData: Service[];
  setLabTestsTableData: Dispatch<SetStateAction<Service[]>>;
  fieldTestsTableData: FieldService[];
  setFieldTestsTableData: Dispatch<SetStateAction<FieldService[]>>;
  selectedLabTests: Service[];
  setSelectedLabTests: Dispatch<SetStateAction<Service[]>>;
  selectedFieldTests: FieldService[];
  setSelectedFieldTests: Dispatch<SetStateAction<FieldService[]>>;
  mobilizationActivity: MobilizationService;
  setMobilizationActivity: Dispatch<SetStateAction<MobilizationService>>;
  reportingActivity: ReportingService;
  setReportingActivity: Dispatch<SetStateAction<ReportingService>>;
}

const quotationOptionsSchema = z.object({
  mobile: z.boolean().default(false).optional(),
  mobilization: z.boolean().default(false).optional(),
  field: z.boolean().default(false).optional(),
  lab: z.boolean().default(false).optional(),
  reporting: z.boolean().default(false).optional(),
});

type QuotationOptionsValues = z.infer<typeof quotationOptionsSchema>;

const defaultValues: Partial<QuotationOptionsValues> = {
  mobilization: false,
  field: false,
  lab: false,
  reporting: false,
};

type SwitchFieldProps = {
  name: keyof QuotationOptionsValues;
  label: string;
  description: string;
  disabled?: boolean;
  quotationOptionsProps: QuotationOptionsProps;
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
  label,
  description,
  disabled = false,
  quotationOptionsProps,
  handleMobilizationValidationChange,
  handleFieldsValidationChange,
  handleLabTestsValidationChange,
  handleReportingValidationChange,
  isMobilizationValid,
  isFieldsValid,
  isLabTestsValid,
  isReportingValid,
}: SwitchFieldProps) => {
  const { project } = quotationOptionsProps;

  const form = useForm<QuotationOptionsValues>({
    resolver: zodResolver(quotationOptionsSchema),
    defaultValues,
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
      ? "transition-all duration-200 ease-in-out rounded-lg border border-destructive p-1"
      : "transition-all duration-200 ease-in-out rounded-lg border p-1";

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
        <Activity
          type="Mobilization"
          initialValues={{
            price: quotationOptionsProps.mobilizationActivity.price,
            quantity: quotationOptionsProps.mobilizationActivity.quantity,
            activity: quotationOptionsProps.mobilizationActivity.activity,
          }}
          onPriceChange={(price) =>
            quotationOptionsProps.setMobilizationActivity({
              ...quotationOptionsProps.mobilizationActivity,
              price,
            })
          }
          onQuantityChange={(quantity) =>
            quotationOptionsProps.setMobilizationActivity({
              ...quotationOptionsProps.mobilizationActivity,
              quantity,
            })
          }
          onActivityChange={(activity) =>
            quotationOptionsProps.setMobilizationActivity({
              ...quotationOptionsProps.mobilizationActivity,
              activity,
            })
          }
          onSubmit={() => null}
          onValidationChange={handleMobilizationValidationChange}
        />
      )}

      {/* Field Tests */}
      {form.getValues("field") && (
        <DataTableFieldTests
          coreFieldRowSelection={quotationOptionsProps.coreFieldRowSelection}
          fieldTestsTableData={quotationOptionsProps.fieldTestsTableData}
          setSelectedFieldTests={quotationOptionsProps.setSelectedFieldTests}
          setFieldTestsTableData={quotationOptionsProps.setFieldTestsTableData}
          setCoreFieldRowSelection={
            quotationOptionsProps.setCoreFieldRowSelection
          }
          onValidationChange={handleFieldsValidationChange}
        />
      )}

      {/* Lab Tests */}
      {form.getValues("lab") && (
        <DataTableLabTests
          coreLabRowSelection={quotationOptionsProps.coreLabRowSelection}
          labTestsTableData={quotationOptionsProps.labTestsTableData}
          setSelectedLabTests={quotationOptionsProps.setSelectedLabTests}
          setLabTestsTableData={quotationOptionsProps.setLabTestsTableData}
          setCoreLabRowSelection={quotationOptionsProps.setCoreLabRowSelection}
          onValidationChange={handleLabTestsValidationChange}
        />
      )}

      {/* Reporting */}
      {form.getValues("reporting") && (
        <Activity
          type="Reporting"
          initialValues={{
            price: quotationOptionsProps.reportingActivity.price,
            quantity: quotationOptionsProps.reportingActivity.quantity,
            activity: quotationOptionsProps.reportingActivity.activity,
          }}
          onPriceChange={(price) =>
            quotationOptionsProps.setReportingActivity({
              ...quotationOptionsProps.reportingActivity,
              price,
            })
          }
          onQuantityChange={(quantity) =>
            quotationOptionsProps.setReportingActivity({
              ...quotationOptionsProps.reportingActivity,
              quantity,
            })
          }
          onActivityChange={(activity) =>
            quotationOptionsProps.setReportingActivity({
              ...quotationOptionsProps.reportingActivity,
              activity,
            })
          }
          onSubmit={() => null}
          onValidationChange={handleReportingValidationChange}
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
    mobilizationActivity,
    reportingActivity,
  } = quotationOptionsProps;

  console.log({
    mobilizationActivity,
    selectedFieldTests,
    selectedLabTests,
    reportingActivity,
  });

  const [isMobilizationValid, setIsMobilizationValid] = useState(false);
  const [isFieldsValid, setIsFieldsValid] = useState(false);
  const [isLabTestsValid, setIsLabTestsValid] = useState(false);
  const [isReportingValid, setIsReportingValid] = useState(false);

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

  const billingInfo = {
    mobilizationActivity: isMobilizationValid
      ? mobilizationActivity
      : { price: 0, quantity: 0, activity: "" },
    labTests: isLabTestsValid ? selectedLabTests : [],
    fieldTests: isFieldsValid ? selectedFieldTests : [],
    reportingActivity: isReportingValid
      ? reportingActivity
      : { price: 0, quantity: 0, activity: "" },
    project,
  };

  return (
    <>
      <div>
        <h3 className="mb-4 font-medium tracking-tight">
          Choose the items to add to the client's quotation
        </h3>
        <div className="space-y-8">
          <SwitchField
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
            <GenerateBillingDocument {...billingInfo} />
          </div>
        </div>
      </div>
    </>
  );
}
