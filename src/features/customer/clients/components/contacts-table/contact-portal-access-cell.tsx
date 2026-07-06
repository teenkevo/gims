"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inviteContactToPortalAction } from "@/lib/actions";
import { toastActionError } from "@/lib/auth/notify-action-error";

type ContactPortalAccess = {
  _id: string;
  appAccessStatus?: string | null;
};

function portalStatusLabel(status?: string | null) {
  switch (status) {
    case "invited":
      return "Invited";
    case "active":
      return "Active";
    case "revoked":
      return "Locked";
    default:
      return "Not invited";
  }
}

function portalStatusVariant(status?: string | null) {
  switch (status) {
    case "invited":
      return "outline" as const;
    case "active":
      return "default" as const;
    case "revoked":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function ContactPortalAccessCell({
  contact,
  onPortalAccessChange,
  readOnly = false,
}: {
  contact: ContactPortalAccess;
  onPortalAccessChange?: () => void;
  readOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const status = contact.appAccessStatus;

  const handleInvite = () => {
    startTransition(async () => {
      const result = await inviteContactToPortalAction(contact._id);
      if (result.status === "ok") {
        toast.success("Portal invitation sent");
        onPortalAccessChange?.();
      } else {
        toastActionError(result);
      }
    });
  };

  const canInvite =
    status !== "active" && status !== "invited" && status !== "revoked";

  return (
    <div className="flex items-center gap-2">
      <Badge variant={portalStatusVariant(status)}>
        {portalStatusLabel(status)}
      </Badge>
      {canInvite && !readOnly && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={handleInvite}
        >
          Invite
        </Button>
      )}
    </div>
  );
}
