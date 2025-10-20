import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Components
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
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
import { PlusCircleIcon } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { RFI } from "../types/rfi.ts";
import { FormSubmitButton } from "@/components/form-submit-button";
import {
  ALL_CLIENTS_QUERYResult,
  ALL_PERSONNEL_QUERYResult,
  ALL_RFIS_QUERYResult,
} from "../../../../../sanity.types.js";
import { createRFI } from "@/lib/actions";

interface CreateRFIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labPersonnel: ALL_PERSONNEL_QUERYResult;
  clients: ALL_CLIENTS_QUERYResult;
}

export function CreateRFIDialog({
  open,
  onOpenChange,
  labPersonnel,
  clients,
}: CreateRFIDialogProps) {
  const [state, dispatch, isPending] = useActionState(createRFI, null);

  const form = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      rfiManager: "",
      initiationType: "" as RFI["initiationType"] | "",
      project: "",
      client: "",
      subject: "",
      description: "",
      labInitiator: "",
      labReceivers: [],
      labInitiatorExternal: "",
      clientReceivers: [],
      clientInitiator: "",
      labReceiversExternal: [],
    },
  });

  // Watch the selected client to filter projects
  const selectedClientId = form.watch("client");

  // Get the selected client
  const selectedClient = clients.find(
    (client) => client._id === selectedClientId
  );

  const selectedProject = selectedClient?.projects?.find(
    (project) => project._id === form.watch("project")
  );

  const selectedProjectContactPersons = selectedProject?.contactPersons;

  // Reset project selection when client changes
  useEffect(() => {
    form.setValue("project", "");
  }, [selectedClientId, form]);

  const onSubmit = (data: {
    rfiManager: string;
    initiationType: RFI["initiationType"] | "";
    project: string;
    client: string;
    subject: string;
    description: string;
    labInitiator: string;
    labReceivers: string[];
    labInitiatorExternal: string;
    clientReceivers: string[];
    clientInitiator: string;
    labReceiversExternal: string[];
  }) => {
    const formData = new FormData();
    formData.append("rfiManager", data.rfiManager || "");
    formData.append("initiationType", data.initiationType || "");
    formData.append("project", data.project || "");
    formData.append("client", data.client || "");
    formData.append("subject", data.subject || "");
    formData.append("description", data.description || "");
    formData.append("labInitiator", data.labInitiator || "");

    // Add multiple receivers
    data.labReceivers.forEach((receiver) =>
      formData.append("labReceivers", receiver)
    );
    data.clientReceivers.forEach((receiver) =>
      formData.append("clientReceivers", receiver)
    );
    data.labReceiversExternal.forEach((receiver) =>
      formData.append("labReceiversExternal", receiver)
    );

    formData.append("labInitiatorExternal", data.labInitiatorExternal || "");
    formData.append("clientInitiator", data.clientInitiator || "");

    console.log({
      data,
    });

    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.status === "ok") {
      toast.success("RFI has been created");
      onOpenChange(false);
      form.reset();
    } else if (state?.status === "error") {
      toast.error((state.error as string) || "Something went wrong");
    }
  }, [state, form]);

  const renderParticipantFields = () => {
    const initiationType = form.watch("initiationType");

    switch (initiationType) {
      case "internal_internal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="labInitiator"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Initiator</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab personnel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {labPersonnel.map((personnel) => (
                        <SelectItem key={personnel._id} value={personnel._id}>
                          <span className="sm:hidden">
                            {personnel.fullName}
                          </span>
                          <span className="hidden sm:inline">
                            {personnel.fullName} -{" "}
                            {personnel.departmentRoles?.[0]?.role}
                          </span>
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
              name="labReceivers"
              rules={{ required: "At least one lab receiver is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Receivers</FormLabel>
                  <MultiSelect
                    options={labPersonnel.map((personnel) => ({
                      label: personnel.fullName || "Unknown",
                      value: personnel._id,
                      description:
                        personnel.departmentRoles?.[0]?.role || undefined,
                    }))}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select lab personnel..."
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "internal_external":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="labInitiatorExternal"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Initiator</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lab personnel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {labPersonnel.map((personnel) => (
                        <SelectItem key={personnel._id} value={personnel._id}>
                          <span className="sm:hidden">
                            {personnel.fullName}
                          </span>
                          <span className="hidden sm:inline">
                            {personnel.fullName} -{" "}
                            {personnel.departmentRoles?.[0]?.role}
                          </span>
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
              name="clientReceivers"
              rules={{ required: "At least one client receiver is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Receivers</FormLabel>
                  <MultiSelect
                    options={
                      selectedProjectContactPersons?.map((contact) => ({
                        label: contact.name || "Unknown",
                        value: contact._id,
                        description: contact.designation || undefined,
                      })) || []
                    }
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select client contacts..."
                    disabled={isPending || !selectedProjectContactPersons}
                  />
                  {!selectedProjectContactPersons && (
                    <p className="text-sm text-muted-foreground">
                      No contact persons found for this project
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case "external_internal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="clientInitiator"
              rules={{ required: "Required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Initiator</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedProjectContactPersons?.map((contact) => (
                        <SelectItem key={contact._id} value={contact._id}>
                          <span className="sm:hidden">{contact.name}</span>
                          <span className="hidden sm:inline">
                            {contact.name} - {contact.designation}
                          </span>
                        </SelectItem>
                      ))}
                      {!selectedProjectContactPersons && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No contact persons found for this client
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="labReceiversExternal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lab Receivers (Optional)</FormLabel>
                  <MultiSelect
                    options={labPersonnel.map((personnel) => ({
                      label: personnel.fullName || "Unknown",
                      value: personnel._id,
                      description:
                        personnel.departmentRoles?.[0]?.role || undefined,
                    }))}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Select lab personnel..."
                    disabled={isPending}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const isMobile = useMediaQuery("(max-width: 640px)");

  const content = (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 h-[460px] px-4 md:px-1 py-4 overflow-y-auto pb-20"
      >
        <FormField
          control={form.control}
          name="rfiManager"
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>RFI Manager</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select RFI manager" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {labPersonnel.map((personnel) => (
                    <SelectItem key={personnel._id} value={personnel._id}>
                      <span className="sm:hidden">{personnel.fullName}</span>
                      <span className="hidden sm:inline">
                        {personnel.fullName} -{" "}
                        {personnel.departmentRoles?.[0]?.role}
                      </span>
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
          name="initiationType"
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initiation Type</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select initiation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="internal_internal">
                    <span className="sm:hidden">Internal</span>
                    <span className="hidden sm:inline">
                      Internal to Internal (Lab to Lab)
                    </span>
                  </SelectItem>
                  <SelectItem value="internal_external">
                    <span className="sm:hidden">Lab to Client</span>
                    <span className="hidden sm:inline">
                      Internal to External (Lab to Client)
                    </span>
                  </SelectItem>
                  <SelectItem value="external_internal">
                    <span className="sm:hidden">Client to Lab</span>
                    <span className="hidden sm:inline">
                      External to Internal (Client to Lab)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {(form.watch("initiationType") === "internal_external" ||
          form.watch("initiationType") === "external_internal") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          <span className="font-bold">{client.internalId}</span>{" "}
                          - {client.name}
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
              name="project"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedClient?.projects?.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          <span className="font-bold">
                            {project.internalId}
                          </span>{" "}
                          - {project.name}
                        </SelectItem>
                      ))}
                      {selectedClient?.projects?.length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No projects found for this client
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="subject"
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="Enter RFI subject"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isPending}
                  placeholder="Describe the information request in detail"
                  className="min-h-[80px] sm:min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("initiationType") && <div>{renderParticipantFields()}</div>}

        <FormSubmitButton text="Create RFI" isSubmitting={isPending} />
      </form>
    </Form>
  );

  return isMobile ? (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (isOpen) {
          form.reset();
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button>
          <PlusCircleIcon className="h-5 w-5 mr-2 " />
          Create New RFI
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create New RFI</DrawerTitle>
          <DrawerDescription>
            Create a new Request for Information
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 pb-0">{content}</div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (isOpen) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Create New RFI
        </Button>
      </DialogTrigger>

      <DialogContent
        aria-describedby={undefined}
        className="w-[95vw] max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Create New RFI</DialogTitle>
          <DialogDescription>
            Create a new Request for Information
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
