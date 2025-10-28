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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Sun, Database, Trash2 } from "lucide-react";
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
  SAMPLE_REVIEW_TEMPLATES_QUERYResult,
  SAMPLE_ADEQUACY_TEMPLATES_QUERYResult,
} from "../../../../../sanity.types";

// Get initial data from templates
const getInitialReviewItems = (
  template: SAMPLE_REVIEW_TEMPLATES_QUERYResult[number]
) => {
  return (
    template.reviewItems?.map((item) => ({
      id: item.id || 0,
      label: item.label || "",
    })) || []
  );
};

const getInitialAdequacyChecks = (
  template: SAMPLE_ADEQUACY_TEMPLATES_QUERYResult[number]
) => {
  return (
    template.adequacyChecks?.map((check) => ({
      id: check.id || 0,
      label: check.label || "",
      required: check.required || false,
    })) || []
  );
};

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
    isReadOnly,
  }: {
    data: ReviewItem[];
    onStatusChange: (id: number, status: string) => void;
    onCommentChange: (id: number, comments: string) => void;
    isValid: boolean;
    isReadOnly: boolean;
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
            <div className="min-w-[200px] md:max-w-[400px] text-wrap break-words">
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
              className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0"
              disabled={isReadOnly}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`yes-${row.original.id}`} />
                <Label
                  htmlFor={`yes-${row.original.id}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`no-${row.original.id}`} />
                <Label
                  htmlFor={`no-${row.original.id}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  No
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="not-applicable"
                  id={`not-applicable-${row.original.id}`}
                />
                <Label
                  htmlFor={`not-applicable-${row.original.id}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  N/A
                </Label>
              </div>
            </RadioGroup>
          ),
        },
        {
          accessorKey: "comments",
          header: "Comments",
          cell: ({ row }) => (
            <div className="space-y-2 w-full min-w-[150px] md:min-w-[200px]">
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
                disabled={isReadOnly}
              />
              {row.original.status === "no" && !row.original.comments && (
                <p className="text-xs text-red-500">Comments are required</p>
              )}
            </div>
          ),
        },
      ],
      [onStatusChange, onCommentChange, isReadOnly]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div
        className={`rounded-md border transition-all duration-500 ease-in-out ${
          isValid ? "border-border" : "border-destructive"
        }`}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="border-r border-border last:border-r-0 whitespace-nowrap"
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
    isReadOnly,
  }: {
    data: AdequacyCheck[];
    onStatusChange: (id: number, status: string) => void;
    onCommentChange: (id: number, comments: string) => void;
    isValid: boolean;
    isReadOnly: boolean;
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
            <div className="max-w-[300px] md:max-w-[400px] text-wrap break-words">
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
              className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0"
              disabled={isReadOnly}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="adequate"
                  id={`adequate-${row.original.id}`}
                />
                <Label
                  htmlFor={`adequate-${row.original.id}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
                  Adequate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="inadequate"
                  id={`inadequate-${row.original.id}`}
                />
                <Label
                  htmlFor={`inadequate-${row.original.id}`}
                  className="text-xs md:text-sm whitespace-nowrap"
                >
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
            <div className="space-y-2 w-full min-w-[150px] md:min-w-[200px]">
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
                disabled={isReadOnly}
              />
              {row.original.status === "inadequate" &&
                !row.original.comments && (
                  <p className="text-xs text-red-500">Comments are required</p>
                )}
            </div>
          ),
        },
      ],
      [onStatusChange, onCommentChange, isReadOnly]
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    });

    return (
      <div
        className={`rounded-md border transition-all duration-500 ease-in-out ${
          isValid ? "border-border" : "border-destructive"
        }`}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-border">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="border-r border-border last:border-r-0 whitespace-nowrap"
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
              <p>Name: {data.sampleReceiptName}</p>
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
  sampleReviewTemplate,
  sampleAdequacyTemplate,
  existingSampleReceipt,
  isReadOnly = false,
  onApprove,
}: {
  setDrawerOpen: (open: boolean) => void;
  setHasUnsavedEdits: (hasEdits: boolean) => void;
  project: PROJECT_BY_ID_QUERYResult[number];
  personnel: ALL_PERSONNEL_QUERYResult;
  sampleReviewTemplate: SAMPLE_REVIEW_TEMPLATES_QUERYResult[number];
  sampleAdequacyTemplate: SAMPLE_ADEQUACY_TEMPLATES_QUERYResult[number];
  existingSampleReceipt?: PROJECT_BY_ID_QUERYResult[number]["sampleReceipt"];
  isReadOnly?: boolean;
  onApprove?: () => void;
}) {
  // Extract values from project
  const clientName = project.clients?.[0]?.name || "Client Name";
  const projectName = project.name || "Sample Receipt Verification";
  const email = project.contactPersons?.[0]?.email || "info@getlab.co.ug";
  // Initialize state with existing data if available
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(() => {
    if (existingSampleReceipt?.reviewItems) {
      return existingSampleReceipt.reviewItems.map((item) => ({
        id: item.templateItemId || 0,
        label: item.label || "",
        status: item.status || "",
        comments: item.comments || "",
      }));
    }
    return getInitialReviewItems(sampleReviewTemplate).map((item) => ({
      ...item,
      status: "",
      comments: "",
    }));
  });

  const [adequacyChecks, setAdequacyChecks] = useState<AdequacyCheck[]>(() => {
    if (existingSampleReceipt?.adequacyChecks) {
      return existingSampleReceipt.adequacyChecks.map((item) => ({
        id: item.templateItemId || 0,
        label: item.label || "",
        required: false, // This will be set from template
        status: item.status || "",
        comments: item.comments || "",
      }));
    }
    return getInitialAdequacyChecks(sampleAdequacyTemplate).map((item) => ({
      ...item,
      status: "",
      comments: "",
    }));
  });

  const [overallStatus, setOverallStatus] = useState<string>(
    existingSampleReceipt?.overallStatus || ""
  );
  const [comments, setComments] = useState<string>(
    existingSampleReceipt?.overallComments || ""
  );
  const [clientAcknowledgement, setClientAcknowledgement] = useState<string>(
    existingSampleReceipt?.clientAcknowledgement?.acknowledgementText ||
      "I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
  );
  const [clientSignature, setClientSignature] = useState<string>(
    existingSampleReceipt?.clientAcknowledgement?.clientSignature || ""
  );
  const [clientRepresentative, setClientRepresentative] = useState<string>(
    existingSampleReceipt?.clientAcknowledgement?.clientRepresentative || ""
  );
  const [getlabAcknowledgement, setGetlabAcknowledgement] = useState<string>(
    existingSampleReceipt?.getlabAcknowledgement?.acknowledgementText || ""
  );
  const [approvalDecision, setApprovalDecision] = useState<string>(
    existingSampleReceipt?.getlabAcknowledgement?.approvalDecision || ""
  );
  const [rejectionReason, setRejectionReason] = useState<string>(
    existingSampleReceipt?.getlabAcknowledgement?.rejectionReason || ""
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<
    Date | undefined
  >(
    existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate
      ? new Date(
          existingSampleReceipt.getlabAcknowledgement.expectedDeliveryDate
        )
      : undefined
  );
  const [sampleRetentionDuration, setSampleRetentionDuration] = useState<
    number | undefined
  >(
    existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration
      ? parseInt(
          existingSampleReceipt.getlabAcknowledgement.sampleRetentionDuration,
          10
        )
      : undefined
  );
  const [sampleReceiptName, setSampleReceiptName] = useState<string>(
    existingSampleReceipt?.sampleReceiptPersonnel?.name || ""
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Update state when existingSampleReceipt changes (for live updates from Sanity)
  useEffect(() => {
    if (existingSampleReceipt?.reviewItems) {
      setReviewItems(
        existingSampleReceipt.reviewItems.map((item) => ({
          id: item.templateItemId || 0,
          label: item.label || "",
          status: item.status || "",
          comments: item.comments || "",
        }))
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [existingSampleReceipt?.reviewItems, setHasUnsavedEdits]);

  useEffect(() => {
    if (existingSampleReceipt?.adequacyChecks) {
      setAdequacyChecks(
        existingSampleReceipt.adequacyChecks.map((item) => ({
          id: item.templateItemId || 0,
          label: item.label || "",
          required: false, // This will be set from template
          status: item.status || "",
          comments: item.comments || "",
        }))
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [existingSampleReceipt?.adequacyChecks, setHasUnsavedEdits]);

  useEffect(() => {
    if (existingSampleReceipt?.overallStatus !== undefined) {
      setOverallStatus(existingSampleReceipt.overallStatus || "");
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [existingSampleReceipt?.overallStatus, setHasUnsavedEdits]);

  useEffect(() => {
    if (existingSampleReceipt?.overallComments !== undefined) {
      setComments(existingSampleReceipt.overallComments || "");
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [existingSampleReceipt?.overallComments, setHasUnsavedEdits]);

  useEffect(() => {
    if (
      existingSampleReceipt?.clientAcknowledgement?.acknowledgementText !==
      undefined
    ) {
      setClientAcknowledgement(
        existingSampleReceipt.clientAcknowledgement.acknowledgementText ||
          "I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.clientAcknowledgement?.acknowledgementText,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (
      existingSampleReceipt?.clientAcknowledgement?.clientSignature !==
      undefined
    ) {
      setClientSignature(
        existingSampleReceipt.clientAcknowledgement.clientSignature || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.clientAcknowledgement?.clientSignature,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (
      existingSampleReceipt?.clientAcknowledgement?.clientRepresentative !==
      undefined
    ) {
      setClientRepresentative(
        existingSampleReceipt.clientAcknowledgement.clientRepresentative || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.clientAcknowledgement?.clientRepresentative,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (
      existingSampleReceipt?.getlabAcknowledgement?.acknowledgementText !==
      undefined
    ) {
      setGetlabAcknowledgement(
        existingSampleReceipt.getlabAcknowledgement.acknowledgementText || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.getlabAcknowledgement?.acknowledgementText,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (
      existingSampleReceipt?.getlabAcknowledgement?.approvalDecision !==
      undefined
    ) {
      setApprovalDecision(
        existingSampleReceipt.getlabAcknowledgement.approvalDecision || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.getlabAcknowledgement?.approvalDecision,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (
      existingSampleReceipt?.getlabAcknowledgement?.rejectionReason !==
      undefined
    ) {
      setRejectionReason(
        existingSampleReceipt.getlabAcknowledgement.rejectionReason || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.getlabAcknowledgement?.rejectionReason,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate) {
      setExpectedDeliveryDate(
        new Date(
          existingSampleReceipt.getlabAcknowledgement.expectedDeliveryDate
        )
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    } else if (
      existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate ===
      null
    ) {
      setExpectedDeliveryDate(undefined);
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.getlabAcknowledgement?.expectedDeliveryDate,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration) {
      setSampleRetentionDuration(
        parseInt(
          existingSampleReceipt.getlabAcknowledgement.sampleRetentionDuration,
          10
        )
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    } else if (
      existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration ===
      null
    ) {
      setSampleRetentionDuration(undefined);
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt?.getlabAcknowledgement?.sampleRetentionDuration,
    setHasUnsavedEdits,
  ]);

  useEffect(() => {
    if (existingSampleReceipt?.sampleReceiptPersonnel?.name !== undefined) {
      setSampleReceiptName(
        existingSampleReceipt.sampleReceiptPersonnel.name || ""
      );
      // Reset unsaved edits when data is updated from Sanity
      setHasUnsavedEdits(false);
    }
  }, [existingSampleReceipt?.sampleReceiptPersonnel?.name, setHasUnsavedEdits]);

  // Handle case when sample receipt is deleted (existingSampleReceipt becomes null/undefined)
  useEffect(() => {
    if (existingSampleReceipt === null || existingSampleReceipt === undefined) {
      // Reset all form data to initial state when sample receipt is deleted
      setReviewItems(
        getInitialReviewItems(sampleReviewTemplate).map((item) => ({
          ...item,
          status: "",
          comments: "",
        }))
      );
      setAdequacyChecks(
        getInitialAdequacyChecks(sampleAdequacyTemplate).map((item) => ({
          ...item,
          status: "",
          comments: "",
        }))
      );
      setOverallStatus("");
      setComments("");
      setClientAcknowledgement(
        "I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
      );
      setClientSignature("");
      setClientRepresentative("");
      setGetlabAcknowledgement("");
      setExpectedDeliveryDate(undefined);
      setSampleRetentionDuration(undefined);
      setSampleReceiptName("");
      // Reset unsaved edits when sample receipt is deleted
      setHasUnsavedEdits(false);
    }
  }, [
    existingSampleReceipt,
    sampleReviewTemplate,
    sampleAdequacyTemplate,
    setHasUnsavedEdits,
  ]);

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

  // Callback to close both drawers
  const handleCloseDrawers = useCallback(() => {
    setDrawerOpen(false);
    setHasUnsavedEdits(false);
  }, [setDrawerOpen]);

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
    // Only validate if acknowledgements are visible (after submission)
    if (
      !existingSampleReceipt?.status ||
      existingSampleReceipt.status === "draft"
    ) {
      return true;
    }
    return true; // Expected delivery date is no longer required
  }, [existingSampleReceipt?.status]);

  const isSampleReceiptPersonnelSectionValid = useCallback(() => {
    return sampleReceiptName !== "";
  }, [sampleReceiptName]);

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
    existingSampleReceipt?.status,
    isGetlabAcknowledgementSectionValid,
    handleGetlabAcknowledgementValidationChange,
  ]);

  useEffect(() => {
    handleSampleReceiptPersonnelValidationChange(
      isSampleReceiptPersonnelSectionValid()
    );
  }, [
    sampleReceiptName,
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
        <p className="text-sm md:mb-5 mb-5 mt-5 text-muted-foreground">
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
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleYesToAllChecks}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  disabled={isReadOnly}
                >
                  Yes to All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNoToAllChecks}
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  disabled={isReadOnly}
                >
                  No to All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="my-5">
              <ValidityChecker isValid={isReviewValid} />
            </div>
            <ReviewTable
              data={reviewItems}
              onStatusChange={handleReviewStatusChange}
              onCommentChange={handleReviewCommentChange}
              isValid={isReviewValid}
              isReadOnly={isReadOnly}
            />
          </CardContent>
        </div>

        <div className="space-y-4">
          <CardHeader className="p-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CardTitle>Adequacy Checks</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdequateToAllChecks}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                  disabled={isReadOnly}
                >
                  Adequate to All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="my-5">
              <ValidityChecker isValid={isAdequacyValid} />
            </div>
            <AdequacyTable
              data={adequacyChecks}
              onStatusChange={handleAdequacyStatusChange}
              onCommentChange={handleAdequacyCommentChange}
              isValid={isAdequacyValid}
              isReadOnly={isReadOnly}
            />
          </CardContent>
        </div>

        <div
          className={`border transition-all duration-500 ease-in-out rounded-lg bg-gradient-to-b from-muted/20 to-muted/40 ${
            isOverallCommentsValid ? "border-border" : "border-destructive"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>
                Overall Comments on Sample Delivered{" "}
                <span className="text-red-500 ml-1">*</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-5">
              <ValidityChecker isValid={isOverallCommentsValid} />
            </div>
            <RadioGroup
              value={overallStatus}
              onValueChange={(value) => {
                setOverallStatus(value);
                debouncedSetHasUnsavedEdits();
              }}
              className="flex flex-col mb-4"
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </CardContent>
        </div>

        {/* Only show client acknowledgement after sample receipt has been submitted for approval */}
        {existingSampleReceipt?.status &&
          existingSampleReceipt.status !== "draft" && (
            <div className="border border-border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg">
              <CardHeader>
                <CardTitle>Client's Acknowledgement</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  disabled
                  className="min-h-[100px]"
                  placeholder="I/We agree that GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
                  value={clientAcknowledgement}
                  onChange={(e) => {
                    setClientAcknowledgement(e.target.value);
                    debouncedSetHasUnsavedEdits();
                  }}
                />
                <div className="mt-4">
                  <Label htmlFor="client-signature">
                    Signature of Customer
                  </Label>
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
                    disabled={isReadOnly}
                  />
                </div>
                <div className="mt-4">
                  <RadioGroup
                    value={clientRepresentative}
                    onValueChange={(value) => {
                      setClientRepresentative(value);
                      debouncedSetHasUnsavedEdits();
                    }}
                    disabled={isReadOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="client-rep" id="client-rep" />
                      <Label htmlFor="client-rep">Client's Rep.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="contractor-rep"
                        id="contractor-rep"
                      />
                      <Label htmlFor="contractor-rep">Contractor's Rep.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="consultant-rep"
                        id="consultant-rep"
                      />
                      <Label htmlFor="consultant-rep">Consultant's Rep.</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </div>
          )}

        <div
          className={`border transition-all duration-500 ease-in-out rounded-lg bg-gradient-to-b from-muted/20 to-muted/40 ${
            isSampleReceiptPersonnelValid
              ? "border-border"
              : "border-destructive"
          }`}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Personnel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-5">
              <ValidityChecker isValid={isSampleReceiptPersonnelValid} />
            </div>
            <div>
              <Label htmlFor="personnel-name">
                Personnel responsible for this sample receipt
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={sampleReceiptName}
                onValueChange={(value) => {
                  setSampleReceiptName(value);
                  debouncedSetHasUnsavedEdits();
                }}
                disabled={isReadOnly}
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
          </CardContent>
        </div>
      </div>

      {/* Always show the Review Sample Receipt button */}
      <GenerateSampleReceiptDocument
        project={project}
        existingSampleReceipt={existingSampleReceipt}
        isReadOnly={isReadOnly}
        onApprove={onApprove}
        sampleReceiptData={{
          sampleReviewTemplate: sampleReviewTemplate._id,
          sampleAdequacyTemplate: sampleAdequacyTemplate._id,
          reviewItems,
          adequacyChecks,
          overallStatus,
          comments,
          clientAcknowledgement,
          clientSignature,
          clientRepresentative,
          getlabAcknowledgement,
          approvalDecision,
          rejectionReason,
          expectedDeliveryDate: expectedDeliveryDate
            ? format(expectedDeliveryDate, "yyyy-MM-dd")
            : "",
          sampleRetentionDuration: sampleRetentionDuration
            ? sampleRetentionDuration.toString()
            : "",
          sampleReceiptName,
          projectName: projectName,
          clientName: clientName,
          email: email,
          sampleReceiptNumber: `SR${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
          personnel:
            personnel?.find(
              (person) => person.fullName === sampleReceiptName
            ) || undefined,
        }}
        onCloseDrawers={handleCloseDrawers}
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
              : undefined,
            sampleRetentionDuration: sampleRetentionDuration
              ? sampleRetentionDuration.toString()
              : "",
            sampleReceiptName,
          }}
        />
      )}
    </div>
  );
}
