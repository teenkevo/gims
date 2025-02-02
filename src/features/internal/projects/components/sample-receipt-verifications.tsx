"use client";

import { useState } from "react";
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
import { Moon, Sun } from "lucide-react";

const initialReviewItems = [
  {
    id: 1,
    label:
      "Has the customer issued any requirements? (i.e. project specifications, TOR...)",
  },
  {
    id: 2,
    label:
      "Are the customer requirements or any opinion and interpretation required on the results of the test?",
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
      "Is the laboratory having capability and resources to meet the customer requirements?",
  },
  {
    id: 8,
    label: "Is the test method adequately defined, documented and understood?",
  },
  {
    id: 9,
    label:
      "Is the condition of sample, proper to conduct the test? Is the sample contaminated?",
  },
  {
    id: 10,
    label: "Are the parameters covered under the scope of accreditation?",
  },
  { id: 11, label: "Sample Label + Sampling Date" },
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
  status: string;
};

type AdequacyCheck = {
  id: number;
  label: string;
  required: boolean;
  status: string;
  comments: string;
};

const ReviewTable = ({
  data,
  onStatusChange,
}: {
  data: ReviewItem[];
  onStatusChange: (id: number, status: string) => void;
}) => {
  const columns: ColumnDef<ReviewItem>[] = [
    {
      accessorKey: "id",
      header: "Sr. No.",
    },
    {
      accessorKey: "label",
      header: "Points Reviewed",
      cell: ({ row }) => (
        <div className="max-w-[300px]">{row.original.label}</div>
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
            <RadioGroupItem
              value="reviewed"
              id={`reviewed-${row.original.id}`}
            />
            <Label htmlFor={`reviewed-${row.original.id}`}>Reviewed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="not-reviewed"
              id={`not-reviewed-${row.original.id}`}
            />
            <Label htmlFor={`not-reviewed-${row.original.id}`}>
              Not Reviewed
            </Label>
          </div>
        </RadioGroup>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="border-2 border-border">
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
  );
};

const AdequacyTable = ({
  data,
  onStatusChange,
  onCommentChange,
}: {
  data: AdequacyCheck[];
  onStatusChange: (id: number, status: string) => void;
  onCommentChange: (id: number, comments: string) => void;
}) => {
  const columns: ColumnDef<AdequacyCheck>[] = [
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
          {row.original.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
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
            <Label htmlFor={`inadequate-${row.original.id}`}>Inadequate</Label>
          </div>
        </RadioGroup>
      ),
    },
    {
      accessorKey: "comments",
      header: "Comments",
      cell: ({ row }) => (
        <Input
          placeholder="Enter comments"
          value={row.original.comments}
          onChange={(e) => onCommentChange(row.original.id, e.target.value)}
        />
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table className="border-2 border-border">
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
  );
};

const SubmittedInfo = ({ data }: { data: any }) => {
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
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2"
                >
                  <span>{item.label}</span>
                  <Badge
                    variant={
                      item.status === "reviewed" ? "default" : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
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
                    : "destructive"
                }
              >
                {data.overallStatus}
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
              <p>Expected delivery date: {data.expectedDeliveryDate}</p>
              <p>Sample retention duration: {data.sampleRetentionDuration}</p>
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
};

export default function SampleReceiptVerification() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(
    initialReviewItems.map((item) => ({ ...item, status: "" }))
  );
  const [adequacyChecks, setAdequacyChecks] = useState<AdequacyCheck[]>(
    initialAdequacyChecks.map((item) => ({ ...item, status: "", comments: "" }))
  );
  const [overallStatus, setOverallStatus] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [clientAcknowledgement, setClientAcknowledgement] =
    useState<string>("");
  const [clientSignature, setClientSignature] = useState<string>("");
  const [clientRepresentative, setClientRepresentative] = useState<string>("");
  const [getlabAcknowledgement, setGetlabAcknowledgement] =
    useState<string>("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>("");
  const [sampleRetentionDuration, setSampleRetentionDuration] =
    useState<string>("");
  const [sampleReceiptRole, setSampleReceiptRole] = useState<string>("");
  const [sampleReceiptName, setSampleReceiptName] = useState<string>("");
  const [sampleReceiptSignature, setSampleReceiptSignature] =
    useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { setTheme } = useTheme();

  const handleReviewStatusChange = (id: number, status: string) => {
    setReviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleAdequacyStatusChange = (id: number, status: string) => {
    setAdequacyChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const handleAdequacyCommentChange = (id: number, comments: string) => {
    setAdequacyChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, comments } : item))
    );
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Geotechnical Review Form</h1>
        <div className="flex items-center space-x-2">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Switch
            id="theme-toggle"
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>D. Details of Review</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewTable
                data={reviewItems}
                onStatusChange={handleReviewStatusChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>E. Adequacy Checks For the Sample Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <AdequacyTable
                data={adequacyChecks}
                onStatusChange={handleAdequacyStatusChange}
                onCommentChange={handleAdequacyCommentChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>F. Overall Comments on Sample Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                onValueChange={setOverallStatus}
                className="flex space-x-4 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="satisfactory" id="satisfactory" />
                  <Label htmlFor="satisfactory">Satisfactory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsatisfactory" id="unsatisfactory" />
                  <Label htmlFor="unsatisfactory">
                    Unsatisfactory/Rejected
                  </Label>
                </div>
              </RadioGroup>
              <Textarea
                placeholder="Enter any additional comments here..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>G. Client's Acknowledgement</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="I/We agree the GETLAB carries out the above tests and issue test report/certificate and I/We further agree to the applicable terms and conditions stated overleaf"
                value={clientAcknowledgement}
                onChange={(e) => setClientAcknowledgement(e.target.value)}
              />
              <div className="mt-4">
                <Label htmlFor="client-signature">Signature of Customer</Label>
                <Input
                  id="client-signature"
                  type="text"
                  placeholder="Enter name as signature"
                  className="mt-1"
                  value={clientSignature}
                  onChange={(e) => setClientSignature(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <RadioGroup onValueChange={setClientRepresentative}>
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>H. GETLAB's Acknowledgement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="expected-delivery-date">
                    Expected delivery date
                  </Label>
                  <Input
                    id="expected-delivery-date"
                    type="date"
                    className="mt-1"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="more-samples" />
                  <Label htmlFor="more-samples">
                    Client Should Deliver More Samples
                  </Label>
                </div>
                <div>
                  <Label htmlFor="sample-retention">
                    Duration for Sample to be Retained Incase Sample Remains
                    After Testing
                  </Label>
                  <Input
                    id="sample-retention"
                    type="text"
                    className="mt-1"
                    value={sampleRetentionDuration}
                    onChange={(e) => setSampleRetentionDuration(e.target.value)}
                  />
                </div>
                <Textarea
                  placeholder="Additional acknowledgement notes..."
                  value={getlabAcknowledgement}
                  onChange={(e) => setGetlabAcknowledgement(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>I. Sample Receipt Personnel</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup onValueChange={setSampleReceiptRole}>
                {[
                  "SLE",
                  "Lab. Eng.",
                  "Jn. Lab. Eng.",
                  "Sen. Lab. Technician",
                  "Lab Technician",
                  "Lab Assistant",
                  "Admin. Personnel",
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
                <Input
                  id="personnel-name"
                  type="text"
                  className="mt-1"
                  value={sampleReceiptName}
                  onChange={(e) => setSampleReceiptName(e.target.value)}
                />
              </div>
              <div className="mt-4">
                <Label htmlFor="personnel-signature">Signature</Label>
                <Input
                  id="personnel-signature"
                  type="text"
                  className="mt-1"
                  value={sampleReceiptSignature}
                  onChange={(e) => setSampleReceiptSignature(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
      <div className="mt-8 flex justify-end">
        <Button className="w-full md:w-auto" onClick={handleSubmit}>
          Submit Review
        </Button>
      </div>

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
            expectedDeliveryDate,
            sampleRetentionDuration,
            sampleReceiptRole,
            sampleReceiptName,
            sampleReceiptSignature,
          }}
        />
      )}
    </div>
  );
}
