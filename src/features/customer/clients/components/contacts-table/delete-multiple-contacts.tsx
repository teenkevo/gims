import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@/components/ui/drawer";
import { DestructiveButtonLoading } from "@/components/button-loading";
import { toast } from "sonner";
import { useActionState } from "react";
import { deleteMultipleContacts } from "@/lib/actions";
import { CLIENT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { AlertTriangle, File } from "lucide-react";
import Link from "next/link";

export function DeleteMultipleContacts({
  contacts,
  open,
  onClose,
}: {
  contacts: CLIENT_BY_ID_QUERYResult[number]["contacts"];
  open: boolean;
  onClose: () => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const contactsInProjects = contacts.filter((contact) => contact.projects.length > 0);

  const contactsNotInProjects = contacts.filter((contact) => contact.projects.length === 0);

  const contactsIdsToDelete = [...contactsNotInProjects.map((contact) => contact._id)];

  const action = async (_: void | null) => {
    const result = await deleteMultipleContacts(contactsIdsToDelete);
    if (result.status === "ok") {
      toast.success("Contacts have been deleted");
      onClose();
    } else {
      toast.error("Something went wrong");
    }
  };

  const [_, dispatch, isPending] = useActionState(action, null);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-3xl"
        >
          <DialogHeader className="space-y-3">
            <DialogTitle>Delete Contacts</DialogTitle>
            {contactsInProjects.length === 0 && (
              <DialogDescription>
                These contacts will be deleted and won't be available for use in any projects as
                contact persons
              </DialogDescription>
            )}
            {contactsInProjects.length > 0 && (
              <DialogDescription>
                Only {contactsNotInProjects.length} contact
                {contactsNotInProjects.length > 1 ? "s" : ""} will be deleted.{" "}
              </DialogDescription>
            )}
            {contactsInProjects.length > 0 ? (
              <>
                <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  {contactsInProjects.length} contact{" "}
                  {contactsInProjects.length > 1 ? "persons " : "person "}
                  {contactsInProjects.length > 1 ? "have " : "has "}
                  projects referencing them and cannot be deleted.
                </div>
                <div className="flex flex-col gap-6">
                  {contactsInProjects.map((contact) => (
                    <div key={contact._id}>
                      <span className="text-sm font-bold">
                        {contact.name} - <span className="font-normal">{contact.email} </span>
                        <span className="text-muted-foreground font-normal">
                          is a contact person in the following{" "}
                          {contact.projects.length > 1 ? "projects" : "project"}
                        </span>
                      </span>
                      <div className="mt-1 flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                        {contact.projects.map((project) => (
                          <Link
                            className="flex items-center gap-2 hover:underline underline-offset-2"
                            href={`/projects/${project._id}`}
                            key={project._id}
                          >
                            <File className="h-4 w-4 mr-2 text-muted-foreground" />
                            {project.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                  <span className="font-bold">Warning</span>: This action is not reversible. Please
                  be certain
                </div>
              </>
            )}
          </DialogHeader>
          <DialogFooter>
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
            {isPending ? (
              <DestructiveButtonLoading />
            ) : (
              <Button
                onClick={() => React.startTransition(() => dispatch())}
                variant="destructive"
                type="submit"
              >
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DrawerHeader className="gap-3 text-left">
          <DialogTitle>Delete Contacts</DialogTitle>
          {contactsInProjects.length === 0 && (
            <DialogDescription>
              These contacts will be deleted and won't be available for use in any projects as
              contact persons
            </DialogDescription>
          )}
          {contactsInProjects.length > 0 ? (
            <>
              <div className="flex items-center gap-2 bg-orange-500/10 text-orange-500 p-3 rounded text-sm">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {contactsInProjects.length} contact{" "}
                {contactsInProjects.length > 1 ? "persons " : "person "}
                {contactsInProjects.length > 1 ? "have " : "has "}
                projects referencing them and you may not be able to delete them
              </div>
              <div className="flex flex-col gap-6">
                {contactsInProjects.map((contact) => (
                  <div key={contact._id}>
                    <span className="text-sm font-bold">
                      {contact.name} - <span className="font-normal">{contact.email} </span>
                      <span className="text-muted-foreground font-normal">
                        is a contact person in the following{" "}
                        {contact.projects.length > 1 ? "projects" : "project"}
                      </span>
                    </span>
                    <div className="mt-1 flex flex-col gap-4 border border-dashed border-orange-500/50 p-3 rounded text-sm">
                      {contact.projects.map((project) => (
                        <Link
                          className="flex items-center gap-2 hover:underline underline-offset-2"
                          href={`/projects/${project._id}`}
                          key={project._id}
                        >
                          <File className="h-4 w-4 mr-2 text-muted-foreground" />
                          {project.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                <span className="font-bold">Warning</span>: This action is not reversible. Please be
                certain
              </div>
            </>
          )}
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          {isPending ? (
            <DestructiveButtonLoading />
          ) : (
            <Button
              onClick={() => React.startTransition(() => dispatch())}
              variant="destructive"
              type="submit"
            >
              Delete
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
