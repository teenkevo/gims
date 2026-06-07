"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Check, ChevronsUpDown, X } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LAB_SECTIONS, LAB_STATUSES } from "../constants";
import type {
  ALL_EQUIPMENT_QUERY_RESULT,
  ALL_PERSONNEL_QUERY_RESULT,
  ALL_SERVICES_QUERY_RESULT,
} from "../../../../../sanity.types";

export type LabFormValues = {
  internalId: string;
  name: string;
  description: string;
  labSection: string;
  status: string;
  location: string;
  capacity: string;
  notes: string;
  personnelIds: string[];
  labHeadId: string;
  equipmentIds: string[];
  testCapabilityIds: string[];
  accreditationStandard: string;
  accreditationCertificateNumber: string;
  accreditationAccreditingBody: string;
  accreditationExpiryDate: string;
};

type Option = { value: string; label: string; sublabel?: string };

function MultiSelectField({
  label,
  description,
  options,
  selected,
  onChange,
  disabled,
  required,
}: {
  label: string;
  description?: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  const selectedOptions = useMemo(
    () => options.filter((opt) => selected.includes(opt.value)),
    [options, selected]
  );

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((id) => id !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const remove = (value: string) => {
    onChange(selected.filter((id) => id !== value));
  };

  return (
    <div className="space-y-2">
      <FormLabel required={required}>{label}</FormLabel>
      {description && <FormDescription>{description}</FormDescription>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between font-normal"
          >
            {selected.length > 0
              ? `${selected.length} selected`
              : `Select ${label.toLowerCase()}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.sublabel && (
                        <span className="text-xs text-muted-foreground">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full outline-none hover:bg-muted"
                onClick={() => remove(option.value)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function LabFormFields({
  form,
  personnel,
  equipment,
  services,
  isSubmitting,
}: {
  form: UseFormReturn<LabFormValues>;
  personnel: ALL_PERSONNEL_QUERY_RESULT;
  equipment: ALL_EQUIPMENT_QUERY_RESULT;
  services: ALL_SERVICES_QUERY_RESULT;
  isSubmitting?: boolean;
}) {
  const personnelIds = form.watch("personnelIds");
  const labHeadOptions = useMemo(
    () =>
      personnel
        .filter((p) => personnelIds.includes(p._id))
        .map((p) => ({
          value: p._id,
          label: p.fullName ?? p.internalId ?? "Unknown",
          sublabel: p.internalId ?? undefined,
        })),
    [personnel, personnelIds]
  );

  const personnelOptions = personnel.map((p) => ({
    value: p._id,
    label: p.fullName ?? p.internalId ?? "Unknown",
    sublabel: p.internalId ?? undefined,
  }));

  const equipmentOptions = equipment.map((e) => ({
    value: e._id,
    label: e.name ?? "Unknown",
    sublabel: e.serialNumber ?? undefined,
  }));

  const serviceOptions = services.map((s) => ({
    value: s._id,
    label: s.testParameter ?? s.code ?? "Unknown test",
    sublabel: s.code ?? undefined,
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Laboratory Identity</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="internalId"
            rules={{ required: "Lab ID is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Lab ID</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            rules={{ required: "Lab name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Lab Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Soil Mechanics Laboratory"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Scope of testing, specialisations, and responsibilities"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="labSection"
            rules={{ required: "Lab section is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Lab Section</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LAB_SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LAB_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workstation Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="e.g. 8"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Building, floor, or site location"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Staffing</h2>
        <FormField
          control={form.control}
          name="personnelIds"
          rules={{
            validate: (value) =>
              value.length > 0 || "At least one staff member is required",
          }}
          render={({ field }) => (
            <FormItem>
              <MultiSelectField
                label="Assigned Personnel"
                description="Technicians and officers assigned to this laboratory"
                options={personnelOptions}
                selected={field.value}
                onChange={(values) => {
                  field.onChange(values);
                  const currentHead = form.getValues("labHeadId");
                  if (currentHead && !values.includes(currentHead)) {
                    form.setValue("labHeadId", "");
                  }
                }}
                disabled={isSubmitting}
                required
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="labHeadId"
          rules={{ required: "Lab head is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Lab Head</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting || labHeadOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        labHeadOptions.length === 0
                          ? "Assign personnel first"
                          : "Select lab head"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {labHeadOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Must be selected from assigned personnel
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Resources & Capabilities</h2>
        <FormField
          control={form.control}
          name="equipmentIds"
          render={({ field }) => (
            <FormItem>
              <MultiSelectField
                label="Equipment"
                description="Instruments and apparatus housed in this laboratory"
                options={equipmentOptions}
                selected={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="testCapabilityIds"
          render={({ field }) => (
            <FormItem>
              <MultiSelectField
                label="Test Capabilities"
                description="Accredited test methods this laboratory can perform"
                options={serviceOptions}
                selected={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Accreditation</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="accreditationStandard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standard</FormLabel>
                <FormControl>
                  <Input placeholder="ISO 17025" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accreditationCertificateNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certificate Number</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accreditationAccreditingBody"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accrediting Body</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. UNBS" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accreditationExpiryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Operational Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Operating hours, access restrictions, calibration schedules"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
