"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActionErrorMessage } from "@/lib/auth/action-errors";
import {
  NOTIFICATION_EVENTS,
  NOTIFICATION_MODULES,
  eventsForModule,
  type NotificationEventType,
  type NotificationModuleId,
} from "../events";
import { saveNotificationSubscription } from "../actions";
import type { NotificationSubscriptionRecord } from "@/sanity/lib/notifications/getNotificationSubscriptions";
import {
  DepartmentMultiSelect,
  type DepartmentOption,
} from "./department-multi-select";

type ListenerState = {
  departmentIds: string[];
  enabled: boolean;
};

function initialState(
  subscriptions: NotificationSubscriptionRecord[]
): Record<NotificationEventType, ListenerState> {
  const byEvent = new Map(
    subscriptions.map((subscription) => [subscription.eventType, subscription])
  );

  return Object.fromEntries(
    NOTIFICATION_EVENTS.map((event) => {
      const subscription = byEvent.get(event.type);
      return [
        event.type,
        {
          departmentIds:
            subscription?.departments.map((department) => department._id) ?? [],
          enabled: subscription?.enabled ?? true,
        },
      ];
    })
  ) as Record<NotificationEventType, ListenerState>;
}

function listeningCount(
  listeners: Record<NotificationEventType, ListenerState>,
  moduleId: NotificationModuleId
) {
  return eventsForModule(moduleId).filter((event) => {
    const listener = listeners[event.type];
    return listener.enabled && listener.departmentIds.length > 0;
  }).length;
}

export function NotificationsView({
  departments,
  subscriptions,
  canManage,
}: {
  departments: DepartmentOption[];
  subscriptions: NotificationSubscriptionRecord[];
  canManage: boolean;
}) {
  const [listeners, setListeners] = useState(() => initialState(subscriptions));
  const [pendingEvent, setPendingEvent] = useState<NotificationEventType | null>(
    null
  );
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const departmentOptions = useMemo(
    () =>
      [...departments].sort((a, b) =>
        (a.department ?? "").localeCompare(b.department ?? "")
      ),
    [departments]
  );

  const persist = (eventType: NotificationEventType, next: ListenerState) => {
    if (!canManage) return;

    setListeners((current) => ({ ...current, [eventType]: next }));
    setPendingEvent(eventType);
    startTransition(async () => {
      const result = await saveNotificationSubscription({
        eventType,
        departmentIds: next.departmentIds,
        enabled: next.enabled,
      });
      if (result.status === "error") {
        toast.error(getActionErrorMessage(result, "Could not save listener"));
        return;
      }
      toast.success("Listener saved");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Subscribe departments to events in each module. Everyone currently in
          a subscribed department is emailed when that event fires.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search events"
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {NOTIFICATION_MODULES.map((module) => {
            const count = listeningCount(listeners, module.id);
            return (
              <TabsTrigger key={module.id} value={module.id} className="gap-2">
                {module.label}
                {count > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {NOTIFICATION_MODULES.map((module) => {
          const events = eventsForModule(module.id).filter((event) => {
            if (!query.trim()) return true;
            const haystack = `${event.label} ${event.description}`.toLowerCase();
            return haystack.includes(query.trim().toLowerCase());
          });
          return (
            <TabsContent key={module.id} value={module.id} className="space-y-4">
              <div className="divide-y rounded-xl border bg-card">
                {events.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No events match that search.
                  </p>
                ) : (
                  events.map((event) => {
                    const listener = listeners[event.type];
                    const saving = isPending && pendingEvent === event.type;

                    return (
                      <div
                        key={event.type}
                        className="grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-start"
                      >
                        <div className="min-w-0">
                          <p className="font-medium">{event.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        <DepartmentMultiSelect
                          options={departmentOptions}
                          selected={listener.departmentIds}
                          disabled={!canManage || saving || !listener.enabled}
                          onChange={(departmentIds) =>
                            persist(event.type, { ...listener, departmentIds })
                          }
                        />
                        <div className="flex items-center gap-2 md:justify-end">
                          <Label
                            htmlFor={`enabled-${event.type}`}
                            className="text-sm"
                          >
                            {listener.enabled ? "On" : "Off"}
                          </Label>
                          <Switch
                            id={`enabled-${event.type}`}
                            checked={listener.enabled}
                            disabled={!canManage || saving}
                            onCheckedChange={(enabled) =>
                              persist(event.type, { ...listener, enabled })
                            }
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
