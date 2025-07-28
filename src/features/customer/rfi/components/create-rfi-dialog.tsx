import type React from "react";

import { useState } from "react";
import type { RFI } from "../types/rfi.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateRFIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRFI: (rfi: Omit<RFI, "id" | "dateSubmitted">) => void;
}

// Mock data for dropdowns
const mockProjects = [
  {
    id: "proj-1",
    name: "Downtown Foundation Analysis",
    client: { id: "client-1", name: "Metro Construction Corp" },
  },
  {
    id: "proj-2",
    name: "Highway Bridge Soil Testing",
    client: { id: "client-2", name: "State DOT" },
  },
  {
    id: "proj-3",
    name: "Residential Complex Geotechnical",
    client: { id: "client-3", name: "Sunrise Developers" },
  },
];

const mockClients = [
  { id: "client-1", name: "Metro Construction Corp" },
  { id: "client-2", name: "State DOT" },
  { id: "client-3", name: "Sunrise Developers" },
];

const mockPersonnel = [
  {
    id: "lab-1",
    name: "Dr. Sarah Johnson",
    role: "Senior Geotechnical Engineer",
  },
  { id: "lab-2", name: "Robert Kim", role: "Field Operations Manager" },
  { id: "lab-3", name: "Maria Rodriguez", role: "Lab Technician" },
  { id: "lab-4", name: "David Park", role: "QA Manager" },
];

const mockContactPersons = [
  { id: "contact-1", name: "Mike Chen", role: "Project Manager" },
  { id: "contact-2", name: "Jennifer Walsh", role: "State Inspector" },
  { id: "contact-3", name: "Tom Wilson", role: "Site Supervisor" },
];

export function CreateRFIDialog({
  open,
  onOpenChange,
  onCreateRFI,
}: CreateRFIDialogProps) {
  const [formData, setFormData] = useState({
    initiationType: "" as RFI["initiationType"] | "",
    project: "",
    client: "",
    subject: "",
    description: "",
    labInitiator: "",
    labReceiver: "",
    labInitiatorExternal: "",
    clientReceiver: "",
    clientInitiator: "",
    labReceiverExternal: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.initiationType ||
      !formData.subject ||
      !formData.description
    ) {
      return;
    }

    const selectedProject = mockProjects.find((p) => p.id === formData.project);
    const selectedClient = mockClients.find((c) => c.id === formData.client);

    const rfi: Omit<RFI, "id" | "dateSubmitted"> = {
      initiationType: formData.initiationType,
      project: selectedProject
        ? { id: selectedProject.id, name: selectedProject.name }
        : undefined,
      client: selectedClient
        ? { id: selectedClient.id, name: selectedClient.name }
        : undefined,
      subject: formData.subject,
      description: formData.description,
      status: "open",
      attachments: [],
      conversation: [],

      // Conditional fields based on initiation type
      ...(formData.initiationType === "internal_internal" && {
        labInitiator: mockPersonnel.find((p) => p.id === formData.labInitiator),
        labReceiver: mockPersonnel.find((p) => p.id === formData.labReceiver),
      }),
      ...(formData.initiationType === "internal_external" && {
        labInitiatorExternal: mockPersonnel.find(
          (p) => p.id === formData.labInitiatorExternal
        ),
        clientReceiver: mockContactPersons.find(
          (c) => c.id === formData.clientReceiver
        ),
      }),
      ...(formData.initiationType === "external_internal" && {
        clientInitiator: mockContactPersons.find(
          (c) => c.id === formData.clientInitiator
        ),
        labReceiverExternal: mockPersonnel.find(
          (p) => p.id === formData.labReceiverExternal
        ),
      }),
    };

    onCreateRFI(rfi);

    // Reset form
    setFormData({
      initiationType: "",
      project: "",
      client: "",
      subject: "",
      description: "",
      labInitiator: "",
      labReceiver: "",
      labInitiatorExternal: "",
      clientReceiver: "",
      clientInitiator: "",
      labReceiverExternal: "",
    });
  };

  const renderParticipantFields = () => {
    switch (formData.initiationType) {
      case "internal_internal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="labInitiator" className="text-sm">
                Lab Initiator
              </Label>
              <Select
                value={formData.labInitiator}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, labInitiator: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select lab personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockPersonnel.map((person) => (
                    <SelectItem
                      key={person.id}
                      value={person.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{person.name}</span>
                      <span className="hidden sm:inline">
                        {person.name} - {person.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="labReceiver" className="text-sm">
                Lab Receiver
              </Label>
              <Select
                value={formData.labReceiver}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, labReceiver: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select lab personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockPersonnel.map((person) => (
                    <SelectItem
                      key={person.id}
                      value={person.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{person.name}</span>
                      <span className="hidden sm:inline">
                        {person.name} - {person.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "internal_external":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="labInitiatorExternal" className="text-sm">
                Lab Initiator
              </Label>
              <Select
                value={formData.labInitiatorExternal}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    labInitiatorExternal: value,
                  }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select lab personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockPersonnel.map((person) => (
                    <SelectItem
                      key={person.id}
                      value={person.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{person.name}</span>
                      <span className="hidden sm:inline">
                        {person.name} - {person.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientReceiver" className="text-sm">
                Client Receiver
              </Label>
              <Select
                value={formData.clientReceiver}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clientReceiver: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select client contact" />
                </SelectTrigger>
                <SelectContent>
                  {mockContactPersons.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{contact.name}</span>
                      <span className="hidden sm:inline">
                        {contact.name} - {contact.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "external_internal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientInitiator" className="text-sm">
                Client Initiator
              </Label>
              <Select
                value={formData.clientInitiator}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clientInitiator: value }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select client contact" />
                </SelectTrigger>
                <SelectContent>
                  {mockContactPersons.map((contact) => (
                    <SelectItem
                      key={contact.id}
                      value={contact.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{contact.name}</span>
                      <span className="hidden sm:inline">
                        {contact.name} - {contact.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="labReceiverExternal" className="text-sm">
                Lab Receiver
              </Label>
              <Select
                value={formData.labReceiverExternal}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    labReceiverExternal: value,
                  }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select lab personnel" />
                </SelectTrigger>
                <SelectContent>
                  {mockPersonnel.map((person) => (
                    <SelectItem
                      key={person.id}
                      value={person.id}
                      className="text-sm"
                    >
                      <span className="sm:hidden">{person.name}</span>
                      <span className="hidden sm:inline">
                        {person.name} - {person.role}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New RFI
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <Label htmlFor="initiationType" className="text-sm">
                  Initiation Type *
                </Label>
                <Select
                  value={formData.initiationType}
                  onValueChange={(value: RFI["initiationType"]) =>
                    setFormData((prev) => ({ ...prev, initiationType: value }))
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select initiation type" />
                  </SelectTrigger>
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
              </div>

              {(formData.initiationType === "internal_external" ||
                formData.initiationType === "external_internal") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project" className="text-sm">
                      Project
                    </Label>
                    <Select
                      value={formData.project}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, project: value }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProjects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            className="text-sm"
                          >
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client" className="text-sm">
                      Client
                    </Label>
                    <Select
                      value={formData.client}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, client: value }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id}
                            className="text-sm"
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm">
                  Subject *
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Enter RFI subject"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the information request in detail"
                  className="min-h-[80px] sm:min-h-[100px] text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {formData.initiationType && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {renderParticipantFields()}
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" className="text-sm">
              Create RFI
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
