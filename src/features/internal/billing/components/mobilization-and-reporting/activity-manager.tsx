import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Activity, type ActivityValue } from "./Activity";
import { PROJECT_BY_ID_QUERYResult } from "../../../../../../sanity.types";
import { v4 as uuidv4 } from "uuid";
interface ActivityItem extends ActivityValue {
  id: string;
  isValid: boolean;
}

export interface ActivityManagerProps {
  type: "Mobilization" | "Reporting";
  onActivitiesChange: (activities: Array<Partial<ActivityValue>>) => void;
  onValidationChange: (isValid: boolean) => void;
  currency: string;
  quotation?: PROJECT_BY_ID_QUERYResult[number]["quotation"];
}

export function ActivityManager({
  quotation,
  type,
  onActivitiesChange,
  onValidationChange,
  currency,
}: ActivityManagerProps) {
  const existingMobilizationActivities =
    quotation?.otherItems
      ?.filter((item) => item.type === "mobilization")
      .map((item) => ({
        id: `${item.type}-${uuidv4()}`,
        activity: item.activity ?? "",
        price: item.unitPrice ?? 0,
        quantity: item.quantity ?? 0,
        total: item.lineTotal ?? 0,
        isValid: true,
      })) || [];

  const existingReportingActivities =
    quotation?.otherItems
      ?.filter((item) => item.type === "reporting")
      .map((item) => ({
        id: `${item.type}-${uuidv4()}`,
        activity: item.activity ?? "",
        price: item.unitPrice ?? 0,
        quantity: item.quantity ?? 0,
        total: item.lineTotal ?? 0,
        isValid: true,
      })) || [];

  const defaultActivities = quotation
    ? type === "Mobilization"
      ? existingMobilizationActivities
      : existingReportingActivities
    : [
        {
          id: `${type}-${Date.now()}`,
          activity: "",
          price: undefined,
          quantity: undefined,
          total: undefined,
          isValid: false,
        },
      ];

  const [activities, setActivities] =
    useState<ActivityItem[]>(defaultActivities);

  // Calculate isAllValid once and use it consistently
  const isAllValid = useMemo(() => {
    return (
      activities.length > 0 && activities.every((activity) => activity.isValid)
    );
  }, [activities]);

  // Update parent component when activities change
  useEffect(() => {
    const simplifiedActivities = activities.map(
      ({ activity, price, quantity, total }) => ({
        activity,
        price,
        quantity,
        total,
      })
    );
    onActivitiesChange(simplifiedActivities);
  }, [activities, onActivitiesChange]);

  // Update parent validation state when isAllValid changes
  useEffect(() => {
    onValidationChange(isAllValid);
  }, [isAllValid, onValidationChange]);

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        id: `${type}-${uuidv4()}`,
        activity: "",
        price: undefined,
        quantity: undefined,
        total: undefined,
        isValid: false,
      },
    ]);
  };

  const removeActivity = (id: string) => {
    if (activities.length > 1) {
      setActivities(activities.filter((activity) => activity.id !== id));
    }
  };

  const updateActivity = useCallback(
    (id: string, field: keyof ActivityValue, value: any) => {
      setActivities((prev) =>
        prev.map((activity) => {
          if (activity.id === id) {
            const updatedActivity = { ...activity, [field]: value };

            // Recalculate total whenever price or quantity changes
            if (field === "price" || field === "quantity") {
              updatedActivity.total =
                (updatedActivity.price || 0) * (updatedActivity.quantity || 0);
            }

            return updatedActivity;
          }
          return activity;
        })
      );
    },
    []
  );

  // Use useCallback to prevent recreation of this function on every render
  const updateValidation = useCallback((id: string, isValid: boolean) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === id ? { ...activity, isValid } : activity
      )
    );
  }, []);

  const totalAmount = activities.reduce(
    (sum, activity) => sum + (activity.total || 0),
    0
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className={`relative border ${
            activity.isValid ? "" : "border-destructive/50 bg-destructive/5"
          } rounded-lg`}
        >
          {activities.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive"
              onClick={() => removeActivity(activity.id)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          <Activity
            key={`activity-${activity.id}`}
            currency={currency}
            type={type}
            initialValues={{
              activity: activity.activity,
              price: activity.price,
              quantity: activity.quantity,
            }}
            onSubmit={() => {}}
            onActivityChange={(value) =>
              updateActivity(activity.id, "activity", value)
            }
            onPriceChange={(value) =>
              updateActivity(activity.id, "price", value)
            }
            onQuantityChange={(value) =>
              updateActivity(activity.id, "quantity", value)
            }
            onValidationChange={(isValid) =>
              updateValidation(activity.id, isValid)
            }
          />
        </div>
      ))}
      <div>
        <Button
          // variant="outline"
          onClick={addActivity}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add another {type.toLocaleLowerCase()} activity
        </Button>
      </div>
    </div>
  );
}
