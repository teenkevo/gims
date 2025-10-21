"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { useTheme } from "next-themes";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Database, Trash2, CalendarIcon } from "lucide-react";
import {
  seedSampleReceiptTemplates,
  deleteAllSampleReceiptTemplates,
} from "@/lib/actions";
import ValidityChecker from "../../billing/components/validity-checker";
import { toast } from "sonner";
import { GenerateSampleReceiptDocument } from "./generate-sample-receipt-document";
import { format } from "date-fns";
import {
  PROJECT_BY_ID_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
} from "../../../../../sanity.types";

const initialReviewItems = [
  {
    id: 1,
    label: "Is the test method adequately defined, documented and understood?",
  },
  {
    id: 2,
    label:
      "Is the laboratory having capability and resources to meet the customer requirements?",
  },
  {
    id: 3,
    label:
      "Is appropriate test method selected for each test and capable of meeting customer requirements?",
  },
  {
    id: 4,
    label:
      "Is the quantity of sample adequate to complete all the tests requested by customer?",
  },
  {
    id: 5,
    label:
      "Does the customer require statement of conformity? If yes, then refer the document against which the statement is to be given.",
  },
  {
    id: 6,
    label:
      "Is the uncertainty of measurement (@ 95% confidence level) needs be taken in to consideration to provide statement of conformity as a decision rule? If No, support the written agreement from the customer in this request.",
  },
  {
    id: 7,
    label:
      "Are the customer requirements or any opinion and interpretation required on the results of the test?",
  },
  {
    id: 8,
    label:
      "Has the customer issued any requirements? (i.e. project specifications, TOR...)",
  },
  {
    id: 9,
    label:
      "Is the condition of sample, proper to conduct the test? Is the sample contaminated?",
  },
  { id: 10, label: "Details of sampling, if any" },
  {
    id: 11,
    label: "Are the parameters covered under the scope of accreditation?",
  },
];

const initialAdequacyChecks = [
  { id: 1, label: "Sample label", required: true },
  { id: 2, label: "Identification no. on the sample", required: true },
  { id: 3, label: "Date of sampling, if any", required: false },
  { id: 4, label: "Details of sampling, if any", required: false },
  { id: 5, label: "Source of sample", required: false },
  {
    id: 6,
    label: "Qnty of sample delivered for the resp. lab test",
    required: true,
  },
  { id: 7, label: "Testing parameters to be evaluated", required: true },
  { id: 8, label: "Testing standards to be used", required: false },
  { id: 9, label: "Acceptance limits for resp. test, if any", required: true },
  { id: 10, label: "Sample is not damaged", required: false },
  { id: 11, label: "Sample is packed properly, if any", required: true },
  { id: 12, label: "State of Sample (Dry or Wet)", required: true },
  { id: 13, label: "Sample Depth", required: false },
  { id: 14, label: "Terms of Reference/Request for Lab Test", required: true },
];

type ReviewItem = {
  id: number;
  label: string;
  status: string; // "yes" | "no" | "not-applicable" | ""
  comments: string;
};

type AdequacyCheck = {
  id: number;
  label: string;
  required: boolean;
  status: string;
  comments: string;
};

const ReviewTable = React.memo(
  ({
    data,
    onStatusChange,
    onCommentChange,
    isValid,
  }: {
    data: ReviewItem[];
    onStatusChange: (id: number, status: string) => void;
    onCommentChange: (id: number, comments: string) => void;
    isValid: boolean;
  }) => {
    const columns: ColumnDef<ReviewItem>[] = useMemo(
      () => [
        {
          accessorKey: "id",
          header: "Sr. No.",
        },
        {
          accessorKey: "label",
          header: "Points Reviewed",
          cell: ({ row }) => (
            <div className="max-w-[400px] text-wrap break-words">
              {row.original.label}
              <span className="text-red-500 ml-1">*</span>
            </div>
          ),
        },
        {
          accessorKey: "status",
          header: "Status of review",
          cell: ({ row }) => (
            <RadioGroup
              value={row.original.status}
              onValueChange={(value) => onStatusChange(row.original.id, value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`yes-${row.original.id}`} />
                <Label htmlFor={`yes-${row.original.id}`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`no-${row.original.id}`} />
                <Label htmlFor={`no-${row.original.id}`}>No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="not-applicable"
                  id={`not-applicable-${row.original.id}`}
                />
                <Label htmlFor={`not-applicable-${row.original.id}`}>
                  Not Applicable
                </Label>
              </div>
            </RadioGroup>
          ),
        },
        {
          accessorKey: "comments",
          header: "Comments",
          cell: ({ row }) => (
            <div className="space-y-2">
              <Input
                placeholder="Enter comments"
                value={row.original.comments}
                onChange={(e) =>
                  onCommentChange(row.original.id, e.target.value)
                }
                className={
                  row.original.status === "no" && !row.original.comments
                    ? "border-red-500"
                    : ""
                }
              />
              {row.original.status === "no" && !row.original.comments && (
                <p className="text-sm text-red-500">
                  Comments are required when status is 'No'
                </p>
              )}
            </div>
          ),
        },
      ],
      [onStatusChange, onCommentChange]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div
        className={`rounded-md border transition-all duration-500 ease-in-out ${
          isValid ? "border-primary" : "border-destructive"
        }`}
      >
        <Table>
          <TableHeader className="border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-r border-border last:border-r-0"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border last:border-b-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-r border-border last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
);

const AdequacyTable = React.memo(
  ({
    data,
    onStatusChange,
    onCommentChange,
    isValid,
  }: {
    data: AdequacyCheck[];
    onStatusChange: (id: number, status: string) => void;
    onCommentChange: (id: number, comments: string) => void;
    isValid: boolean;
  }) => {
    const columns: ColumnDef<AdequacyCheck>[] = useMemo(
      () => [
        {
          accessorKey: "id",
          header: "No.",
        },
        {
          accessorKey: "label",
          header: "Requirements",
          cell: ({ row }) => (
            <div>
              {row.original.label}
              <span className="text-red-500 ml-1">*</span>
            </div>
          ),
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => (
            <RadioGroup
              value={row.original.status}
              onValueChange={(value) => onStatusChange(row.original.id, value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="adequate"
                  id={`adequate-${row.original.id}`}
                />
                <Label htmlFor={`adequate-${row.original.id}`}>Adequate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="inadequate"
                  id={`inadequate-${row.original.id}`}
                />
                <Label htmlFor={`inadequate-${row.original.id}`}>
                  Inadequate
                </Label>
              </div>
            </RadioGroup>
          ),
        },
        {
          accessorKey: "comments",
          header: "Comments",
          cell: ({ row }) => (
            <div className="space-y-2">
              <Input
                placeholder="Enter comments"
                value={row.original.comments}
                onChange={(e) =>
                  onCommentChange(row.original.id, e.target.value)
                }
                className={
                  row.original.status === "inadequate" && !row.original.comments
                    ? "border-red-500"
                    : ""
                }
              />
              {row.original.status === "inadequate" &&
                !row.original.comments && (
                  <p className="text-sm text-red-500">
                    Comments are required when status is 'Inadequate'
                  </p>
                )}
            </div>
          ),
        },
      ],
      [onStatusChange, onCommentChange]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div
        className={`rounded-md border-2 transition-all duration-500 ease-in-out ${
          isValid ? "border-primary" : "border-destructive"
        }`}
      >
        <Table>
          <TableHeader className="border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-r border-border last:border-r-0"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="border-b border-border last:border-b-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-r border-border last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
);

const SubmittedInfo = React.memo(({ data }: { data: any }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Submitted Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="review-details">
            <AccordionTrigger>Review Details</AccordionTrigger>
            <AccordionContent>
              {data.reviewItems.map((item: ReviewItem) => (
                <div key={item.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <span>{item.label}</span>
                    <Badge
                      variant={
                        item.status === "yes"
                          ? "default"
                          : item.status === "no"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.comments && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.comments}
                    </div>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="adequacy-checks">
            <AccordionTrigger>Adequacy Checks</AccordionTrigger>
            <AccordionContent>
              {data.adequacyChecks.map((item: AdequacyCheck) => (
                <div key={item.id} className="py-2">
                  <div className="flex justify-between items-center">
                    <span>{item.label}</span>
                    <Badge
                      variant={
                        item.status === "adequate" ? "default" : "destructive"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.comments && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.comments}
                    </div>
                  )}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="overall-comments">
            <AccordionTrigger>Overall Comments</AccordionTrigger>
            <AccordionContent>
              <Badge
                variant={
                  data.overallStatus === "satisfactory"
                    ? "default"
                    : data.overallStatus ===
                        "client-should-deliver-more-samples"
                      ? "secondary"
                      : "destructive"
                }
              >
                {data.overallStatus === "client-should-deliver-more-samples"
                  ? "Client Should Deliver More Samples"
                  : data.overallStatus}
              </Badge>
              <p className="mt-2">{data.comments}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="client-acknowledgement">
            <AccordionTrigger>Client's Acknowledgement</AccordionTrigger>
            <AccordionContent>
              <p>{data.clientAcknowledgement}</p>
              <p className="mt-2">Signed by: {data.clientSignature}</p>
              <Badge>{data.clientRepresentative}</Badge>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="getlab-acknowledgement">
            <AccordionTrigger>GETLAB's Acknowledgement</AccordionTrigger>
            <AccordionContent>
              <p>
                Expected delivery date:{" "}
                {data.expectedDeliveryDate
                  ? format(new Date(data.expectedDeliveryDate), "PPP")
                  : "Not set"}
              </p>
              <p>
                Sample retention duration:{" "}
                {data.sampleRetentionDuration
                  ? `${data.sampleRetentionDuration} days`
                  : "Not specified"}
              </p>
              <p className="mt-2">{data.getlabAcknowledgement}</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="sample-receipt">
            <AccordionTrigger>Sample Receipt Personnel</AccordionTrigger>
            <AccordionContent>
              <p>Role: {data.sampleReceiptRole}</p>
              <p>Name: {data.sampleReceiptName}</p>
              <p>Signature: {data.sampleReceiptSignature}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
});

export function SampleVerificationContent({
  setDrawerOpen,
  setHasUnsavedEdits,
  project,
  personnel,
}: {
  setDrawerOpen: (open: boolean) => void;
  setHasUnsavedEdits: (hasEdits: boolean) => void;
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
}) {
  // Extract values from project
  const clientName = project.clients?.[0]?.name || "Client Name";
  const projectName = project.name || "Sample Receipt Verification";
  const email = project.contactPersons?.[0]?.email || "info@getlab.co.ug";
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(
    initialReviewItems.map((item) => ({ ...item, status: "", comments: "" }))
  );
  const [adequacyChecks, setAdequacyChecks] = useState<AdequacyCheck[]>(
    initialAdequacyChecks.map((item) => ({ ...item, status: "", comments: "" }))
  );
  const [overallStatus, setOverallStatus] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [clientAcknowledgement, setClientAcknowledgement] = useState<string>(
    "I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
  );
  const [clientSignature, setClientSignature] = useState<string>("");
  const [clientRepresentative, setClientRepresentative] = useState<string>("");
  const [getlabAcknowledgement, setGetlabAcknowledgement] =
    useState<string>("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<
    Date | undefined
  >(undefined);
  const [sampleRetentionDuration, setSampleRetentionDuration] = useState<
    number | undefined
  >(undefined);
  const [sampleReceiptRole, setSampleReceiptRole] = useState<string>("");
  const [sampleReceiptName, setSampleReceiptName] = useState<string>("");
  const [sampleReceiptSignature, setSampleReceiptSignature] =
    useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Validation states
  const [isReviewValid, setIsReviewValid] = useState<boolean>(false);
  const [isAdequacyValid, setIsAdequacyValid] = useState<boolean>(false);
  const [isOverallCommentsValid, setIsOverallCommentsValid] =
    useState<boolean>(false);
  const [isGetlabAcknowledgementValid, setIsGetlabAcknowledgementValid] =
    useState<boolean>(false);
  const [isSampleReceiptPersonnelValid, setIsSampleReceiptPersonnelValid] =
    useState<boolean>(false);

  const { setTheme } = useTheme();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced function to set unsaved edits
  const debouncedSetHasUnsavedEdits = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setHasUnsavedEdits(true);
    }, 300); // 300ms debounce
  }, []);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Validation change handlers
  const handleReviewValidationChange = useCallback((isValid: boolean) => {
    setIsReviewValid(isValid);
  }, []);

  const handleAdequacyValidationChange = useCallback((isValid: boolean) => {
    setIsAdequacyValid(isValid);
  }, []);

  const handleOverallCommentsValidationChange = useCallback(
    (isValid: boolean) => {
      setIsOverallCommentsValid(isValid);
    },
    []
  );

  const handleGetlabAcknowledgementValidationChange = useCallback(
    (isValid: boolean) => {
      setIsGetlabAcknowledgementValid(isValid);
    },
    []
  );

  const handleSampleReceiptPersonnelValidationChange = useCallback(
    (isValid: boolean) => {
      setIsSampleReceiptPersonnelValid(isValid);
    },
    []
  );

  // Validation logic
  const isReviewSectionValid = useCallback(() => {
    return reviewItems.every((item) => {
      if (item.status === "no") {
        return item.comments.trim() !== "";
      }
      return item.status !== "";
    });
  }, [reviewItems]);

  const isAdequacySectionValid = useCallback(() => {
    return adequacyChecks.every((item) => {
      if (item.status === "inadequate") {
        return item.comments.trim() !== "";
      }
      return item.status !== "";
    });
  }, [adequacyChecks]);

  const isOverallCommentsSectionValid = useCallback(() => {
    return overallStatus !== "";
  }, [overallStatus]);

  const isGetlabAcknowledgementSectionValid = useCallback(() => {
    return true; // Expected delivery date is no longer required
  }, []);

  const isSampleReceiptPersonnelSectionValid = useCallback(() => {
    return (
      sampleReceiptRole !== "" &&
      sampleReceiptName !== "" &&
      sampleReceiptSignature !== ""
    );
  }, [sampleReceiptRole, sampleReceiptName, sampleReceiptSignature]);

  // Update validation states when data changes
  useEffect(() => {
    handleReviewValidationChange(isReviewSectionValid());
  }, [reviewItems, isReviewSectionValid, handleReviewValidationChange]);

  useEffect(() => {
    handleAdequacyValidationChange(isAdequacySectionValid());
  }, [adequacyChecks, isAdequacySectionValid, handleAdequacyValidationChange]);

  useEffect(() => {
    handleOverallCommentsValidationChange(isOverallCommentsSectionValid());
  }, [
    overallStatus,
    isOverallCommentsSectionValid,
    handleOverallCommentsValidationChange,
  ]);

  useEffect(() => {
    handleGetlabAcknowledgementValidationChange(
      isGetlabAcknowledgementSectionValid()
    );
  }, [
    isGetlabAcknowledgementSectionValid,
    handleGetlabAcknowledgementValidationChange,
  ]);

  useEffect(() => {
    handleSampleReceiptPersonnelValidationChange(
      isSampleReceiptPersonnelSectionValid()
    );
  }, [
    sampleReceiptRole,
    sampleReceiptName,
    sampleReceiptSignature,
    isSampleReceiptPersonnelSectionValid,
    handleSampleReceiptPersonnelValidationChange,
  ]);

  const handleReviewStatusChange = useCallback(
    (id: number, status: string) => {
      setReviewItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      debouncedSetHasUnsavedEdits();
    },
    [debouncedSetHasUnsavedEdits]
  );

  const handleReviewCommentChange = useCallback(
    (id: number, comments: string) => {
      setReviewItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, comments } : item))
      );
      debouncedSetHasUnsavedEdits();
    },
    [debouncedSetHasUnsavedEdits]
  );

  const handleAdequacyStatusChange = useCallback(
    (id: number, status: string) => {
      setAdequacyChecks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      debouncedSetHasUnsavedEdits();
    },
    [debouncedSetHasUnsavedEdits]
  );

  const handleAdequacyCommentChange = useCallback(
    (id: number, comments: string) => {
      setAdequacyChecks((prev) =>
        prev.map((item) => (item.id === id ? { ...item, comments } : item))
      );
      debouncedSetHasUnsavedEdits();
    },
    [debouncedSetHasUnsavedEdits]
  );

  // Bulk action handlers for General Checks
  const handleYesToAllChecks = useCallback(() => {
    setReviewItems((prev) =>
      prev.map((item) => ({ ...item, status: "yes", comments: "" }))
    );
    setHasUnsavedEdits(true);
  }, []);

  const handleNoToAllChecks = useCallback(() => {
    setReviewItems((prev) =>
      prev.map((item) => ({ ...item, status: "no", comments: "" }))
    );
    setHasUnsavedEdits(true);
  }, []);

  // Bulk action handler for Adequacy Checks
  const handleAdequateToAllChecks = useCallback(() => {
    setAdequacyChecks((prev) =>
      prev.map((item) => ({ ...item, status: "adequate", comments: "" }))
    );
    setHasUnsavedEdits(true);
  }, []);

  const handleSeedTemplates = useCallback(async () => {
    setIsSeeding(true);
    try {
      const result = await seedSampleReceiptTemplates();
      if (result.status === "ok") {
        toast.success("Templates seeded successfully!");
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to seed templates");
    } finally {
      setIsSeeding(false);
    }
  }, []);

  const handleDeleteTemplates = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to delete all templates? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAllSampleReceiptTemplates();
      if (result.status === "ok") {
        alert(
          `Success: ${result.result?.message || "Templates deleted successfully"}`
        );
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to delete templates");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm mb-5 text-muted-foreground">
          Every field marked with <span className="text-red-500 ml-1">*</span>{" "}
          is required.
        </p>
        {/* <h1 className="text-2xl font-bold">Sample Receipt Verification</h1> */}
        {/* <div className="flex gap-2">
          <Button
            onClick={handleSeedTemplates}
            disabled={isSeeding}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed Templates"}
          </Button>
          <Button
            onClick={handleDeleteTemplates}
            disabled={isDeleting}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Templates"}
          </Button>
        </div> */}
      </div>

      <div className="space-y-10">
        <div className="space-y-4">
          <CardHeader className="p-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle>General Checks</CardTitle>
                <ValidityChecker isValid={isReviewValid} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleYesToAllChecks}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  Yes to All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNoToAllChecks}
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                >
                  No to All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ReviewTable
              data={reviewItems}
              onStatusChange={handleReviewStatusChange}
              onCommentChange={handleReviewCommentChange}
              isValid={isReviewValid}
            />
          </CardContent>
        </div>

        <div className="space-y-4">
          <CardHeader className="p-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle>Adequacy Checks</CardTitle>
                <ValidityChecker isValid={isAdequacyValid} />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdequateToAllChecks}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  Adequate to All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <AdequacyTable
              data={adequacyChecks}
              onStatusChange={handleAdequacyStatusChange}
              onCommentChange={handleAdequacyCommentChange}
              isValid={isAdequacyValid}
            />
          </CardContent>
        </div>

        <div
          className={`border-2 transition-all duration-500 ease-in-out rounded-lg bg-gradient-to-b from-muted/20 to-muted/40 ${
            isOverallCommentsValid ? "border-primary" : "border-destructive"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>
                Overall Comments on Sample Delivered{" "}
                <span className="text-red-500 ml-1">*</span>
              </CardTitle>
              <ValidityChecker isValid={isOverallCommentsValid} />
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(value) => {
                setOverallStatus(value);
                debouncedSetHasUnsavedEdits();
              }}
              className="flex space-x-4 mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="satisfactory" id="satisfactory" />
                <Label htmlFor="satisfactory">Satisfactory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unsatisfactory" id="unsatisfactory" />
                <Label htmlFor="unsatisfactory">Unsatisfactory/Rejected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="client-should-deliver-more-samples"
                  id="client-should-deliver-more-samples"
                />
                <Label htmlFor="client-should-deliver-more-samples">
                  Client Should Deliver More Samples
                </Label>
              </div>
            </RadioGroup>
            <Textarea
              placeholder="Enter any additional comments here..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                debouncedSetHasUnsavedEdits();
              }}
            />
          </CardContent>
        </div>

        <div className="border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
          <CardHeader>
            <CardTitle>Client's Acknowledgement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              disabled
              placeholder="I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
              value={clientAcknowledgement}
              onChange={(e) => {
                setClientAcknowledgement(e.target.value);
                debouncedSetHasUnsavedEdits();
              }}
            />
            <div className="mt-4">
              <Label htmlFor="client-signature">Signature of Customer</Label>
              <Input
                id="client-signature"
                type="text"
                placeholder="Enter name as signature"
                className="mt-1"
                value={clientSignature}
                onChange={(e) => {
                  setClientSignature(e.target.value);
                  debouncedSetHasUnsavedEdits();
                }}
              />
            </div>
            <div className="mt-4">
              <RadioGroup
                onValueChange={(value) => {
                  setClientRepresentative(value);
                  debouncedSetHasUnsavedEdits();
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="client-rep" id="client-rep" />
                  <Label htmlFor="client-rep">Client's Rep.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contractor-rep" id="contractor-rep" />
                  <Label htmlFor="contractor-rep">Contractor's Rep.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="consultant-rep" id="consultant-rep" />
                  <Label htmlFor="consultant-rep">Consultant's Rep.</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </div>

        <div className="border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
          <CardHeader>
            <CardTitle>GETLAB's Acknowledgement </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="expected-delivery-date">
                  Expected delivery date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="expected-delivery-date"
                      variant="outline"
                      className={`mt-1 w-full justify-start text-left font-normal ${
                        !expectedDeliveryDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expectedDeliveryDate ? (
                        format(expectedDeliveryDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expectedDeliveryDate}
                      onSelect={(date) => {
                        setExpectedDeliveryDate(date);
                        debouncedSetHasUnsavedEdits();
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="sample-retention">
                  Duration for Sample to be Retained Incase Sample Remains After
                  Testing (days)
                </Label>
                <Input
                  id="sample-retention"
                  type="number"
                  min="0"
                  placeholder="Enter number of days"
                  className="mt-1"
                  value={sampleRetentionDuration || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSampleRetentionDuration(
                      value ? parseInt(value, 10) : undefined
                    );
                    debouncedSetHasUnsavedEdits();
                  }}
                />
              </div>
              <Textarea
                placeholder="Additional acknowledgement notes..."
                value={getlabAcknowledgement}
                onChange={(e) => {
                  setGetlabAcknowledgement(e.target.value);
                  debouncedSetHasUnsavedEdits();
                }}
              />
            </div>
          </CardContent>
        </div>

        <div
          className={`border-2 transition-all duration-500 ease-in-out rounded-lg bg-gradient-to-b from-muted/20 to-muted/40 ${
            isSampleReceiptPersonnelValid
              ? "border-primary"
              : "border-destructive"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Sample Receipt Personnel</CardTitle>
              <ValidityChecker isValid={isSampleReceiptPersonnelValid} />
            </div>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(value) => {
                setSampleReceiptRole(value);
                debouncedSetHasUnsavedEdits();
              }}
            >
              {[
                "Senior Laboratory Engineer",
                "Laboratory Engineer",
                "Junior Laboratory Engineer",
                "Senior Laboratory Technician",
                "Laboratory Technician",
                "Laboratory Assistant",
                "Administrative Personnel",
              ].map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={role.toLowerCase().replace(/\s+/g, "-")}
                    id={role.toLowerCase().replace(/\s+/g, "-")}
                  />
                  <Label htmlFor={role.toLowerCase().replace(/\s+/g, "-")}>
                    {role}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <div className="mt-4">
              <Label htmlFor="personnel-name">Name</Label>
              <Select
                value={sampleReceiptName}
                onValueChange={(value) => {
                  setSampleReceiptName(value);
                  debouncedSetHasUnsavedEdits();
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select personnel" />
                </SelectTrigger>
                <SelectContent>
                  {personnel.map((person) => (
                    <SelectItem key={person._id} value={person.fullName || ""}>
                      {person.fullName} -{" "}
                      {person.departmentRoles?.[0]?.role || "No role"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label htmlFor="personnel-signature">Signature</Label>
              <Input
                id="personnel-signature"
                type="text"
                className="mt-1"
                value={sampleReceiptSignature}
                onChange={(e) => {
                  setSampleReceiptSignature(e.target.value);
                  debouncedSetHasUnsavedEdits();
                }}
              />
            </div>
          </CardContent>
        </div>
      </div>

      {/* Always show the Review Sample Receipt button */}
      <GenerateSampleReceiptDocument
        setDrawerOpen={(value) =>
          setDrawerOpen(typeof value === "function" ? value(false) : value)
        }
        sampleReceiptData={{
          reviewItems,
          adequacyChecks,
          overallStatus,
          comments,
          clientAcknowledgement,
          clientSignature,
          clientRepresentative,
          getlabAcknowledgement,
          expectedDeliveryDate: expectedDeliveryDate
            ? format(expectedDeliveryDate, "yyyy-MM-dd")
            : "",
          sampleRetentionDuration: sampleRetentionDuration
            ? sampleRetentionDuration.toString()
            : "",
          sampleReceiptRole,
          sampleReceiptName,
          sampleReceiptSignature,
          projectName: projectName,
          clientName: clientName,
          email: email,
          sampleReceiptNumber: `SR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
        }}
      />

      {isSubmitted && (
        <SubmittedInfo
          data={{
            reviewItems,
            adequacyChecks,
            overallStatus,
            comments,
            clientAcknowledgement,
            clientSignature,
            clientRepresentative,
            getlabAcknowledgement,
            expectedDeliveryDate: expectedDeliveryDate
              ? format(expectedDeliveryDate, "yyyy-MM-dd")
              : "",
            sampleRetentionDuration: sampleRetentionDuration
              ? sampleRetentionDuration.toString()
              : "",
            sampleReceiptRole,
            sampleReceiptName,
            sampleReceiptSignature,
          }}
        />
      )}
    </div>
  );
}
