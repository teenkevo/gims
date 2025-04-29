"use client";

import {
  ArrowLeftCircle,
  Download,
  ExternalLink,
  FileText,
  Trash,
  Upload,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  ALL_STANDARDS_QUERYResult,
  ALL_TEST_METHODS_QUERYResult,
  TEST_METHOD_BY_ID_QUERYResult,
} from "../../../../../../sanity.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import mime from "mime-types";
import { DataTableRowActions } from "./test-methods-table/data-table-row-actions";
import { DeleteFile } from "./delete-test-method-file";
import {
  addFilesToTestMethod,
  getTestMethodsReferencingFile,
} from "@/lib/actions";
import FileUpload from "@/components/file-upload";
import { toast } from "sonner";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ButtonLoading } from "@/components/button-loading";
import { ReloadIcon } from "@radix-ui/react-icons";
export default function TestMethodDetails({
  testMethod,
  standards,
}: {
  testMethod: TEST_METHOD_BY_ID_QUERYResult[number];
  standards: ALL_STANDARDS_QUERYResult;
}) {
  const [activeTab, setActiveTab] = useState("description");
  const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState(false);
  const [referencingDocs, setReferencingDocs] = useState<
    ALL_TEST_METHODS_QUERYResult[number][]
  >([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { code, description, standard, documents } = testMethod;

  // Restored useActionState
  const [state, dispatch, isPending] = React.useActionState(
    addFilesToTestMethod,
    null
  );

  const handleUpload = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      const result = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (result.status === 200) {
        const data = await result.json();
        data?.files?.forEach(
          (file: {
            fileId: string;
            url: string;
            fileName: string;
            key: string;
          }) => {
            formData.append("documents", file.fileId);
          }
        );
        formData.append("testMethodId", testMethod._id);
        formData.delete("files");
        setLoading(false);
        React.startTransition(() => dispatch(formData));
        toast.success("Files uploaded successfully");
        setFiles([]);
        setOpen(false);
      } else {
        toast.error("Failed to upload files");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Failed to upload files");
      setLoading(false);
    }
  };

  return (
    <>
      <Link
        className="mb-10 text-sm inline-flex tracking-tight underline underline-offset-4"
        href="/services/test-methods"
      >
        <ArrowLeftCircle className="mr-5 text-primary" />
        Go back to test methods
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex w-[60px] items-center">
              <Badge variant="outline">{standard?.acronym}</Badge>
            </div>
            <p className="text-sm text-muted-foreground my-1">Test Method</p>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-6">{code}</h1>
        </div>

        <div className="flex space-x-2">
          <DataTableRowActions
            redirect={true}
            testMethod={testMethod}
            standards={standards}
          />
        </div>
      </div>
      {/* Tabs */}
      <Tabs
        defaultValue="description"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
            <CardHeader>
              <CardTitle className="text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {description || "No description"}
              </p>
              <div className="flex-wrap mt-6 -mx-6 -mb-6 px-6 py-4 flex rounded-b-xl bg-muted/50 justify-between border-t items-center">
                <h3 className="text-lg font-medium mb-3"></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Standard Designation
                    </p>
                    <p className="font-medium">{standard?.name}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-medium">2013</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="border bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg ">
            <CardHeader>
              <CardTitle className="text-xl">Related Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Access and download the any documents related to this test
                method.
              </p>

              <div className="space-y-4 mb-4">
                {documents?.map((doc) => (
                  <div
                    key={doc.asset?._id}
                    className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4"
                  >
                    <div className="flex items-center">
                      <div className="bg-red-600 dark:bg-red-500 p-2 rounded mr-4">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <Link
                        className="hover:underline underline-offset-2 transition-all"
                        href={doc.asset?.url || ""}
                        target="_blank"
                      >
                        <p className="font-medium">
                          {doc.name || doc.asset?.originalFilename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {doc.asset?.mimeType?.toUpperCase()} •{" "}
                          {(doc.asset?.size || 0 / (1024 * 1024)).toFixed(2) +
                            " MB"}
                        </p>
                      </Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Link
                          className="flex items-center"
                          href={doc.asset?.url || ""}
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Link
                          className="flex items-center"
                          href={`${doc.asset?.url || ""}?dl=${doc.name}.${mime.extension(doc.asset?.mimeType || "")}`}
                        >
                          <Download className="h-4 w-4 mr-2 text-primary" />
                          Download
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          const docs = await getTestMethodsReferencingFile(
                            doc.asset?._id || ""
                          );
                          setReferencingDocs(docs);
                          setOpenDeleteFileDialog(true);
                        }}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                      <DeleteFile
                        id={doc.asset?._id || ""}
                        open={openDeleteFileDialog}
                        onClose={() => setOpenDeleteFileDialog(false)}
                        referencingDocs={referencingDocs}
                        currentTestMethodId={testMethod._id}
                        fileKey={doc._key}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {documents?.length === 0 ? (
                <div className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4">
                  <p className="text-sm text-muted-foreground">
                    No documents found
                  </p>
                  <FileUpload
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    maxSize={20}
                    onFilesChange={(files) => {
                      setFiles(files);
                    }}
                  />
                  {files.length > 0 &&
                    (isPending || loading ? (
                      <Button disabled>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </Button>
                    ) : (
                      <Button
                        disabled={loading || isPending}
                        variant="default"
                        size="sm"
                        onClick={handleUpload}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    ))}
                </div>
              ) : (
                <Button
                  onClick={() => setOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2 text-orange-500" />
                  Add more
                </Button>
              )}

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add more files</DialogTitle>
                    <DialogDescription>
                      Add more files to your test method here. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-wrap items-center justify-between bg-muted/50 p-4 rounded-lg gap-4">
                    <p className="text-sm text-muted-foreground">
                      No documents found
                    </p>
                    <FileUpload
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      maxSize={20}
                      onFilesChange={(files) => {
                        setFiles(files);
                      }}
                    />
                    {files.length > 0 &&
                      (isPending || loading ? (
                        <Button disabled>
                          <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                          Please wait
                        </Button>
                      ) : (
                        <Button
                          disabled={loading || isPending}
                          variant="default"
                          size="sm"
                          onClick={handleUpload}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
