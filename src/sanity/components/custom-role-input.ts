import React, { useState, useEffect } from "react";
import { useFormValue, useClient } from "sanity";
import { StringInputProps } from "sanity";
import { apiVersion } from "../env";

interface RoleOption {
  title: string;
  value: string;
}

const CustomRoleInput = (props: StringInputProps) => {
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(false);

  const document = useFormValue([]) as any;
  // Get Sanity client
  const client = useClient({ apiVersion: "2025-05-06" });

  const departmentRef = document.departmentRoles[0]?.department?._ref;

  useEffect(() => {
    const fetchRoles = async () => {
      if (!departmentRef) {
        setRoleOptions([]);
        return;
      }

      setLoading(true);

      try {
        const department = await client.fetch(
          `*[_type == "department" && _id == $departmentId][0]`,
          { departmentId: departmentRef }
        );

        console.log(department);

        if (department?.roles && Array.isArray(department.roles)) {
          const options: RoleOption[] = department.roles.map((role: any) => ({
            title: role.roleName,
            value: role.roleName,
          }));

          setRoleOptions(options);
        } else {
          setRoleOptions([]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [departmentRef, client]);

  return props.renderDefault({
    ...props,
    schemaType: {
      ...props.schemaType,
      options: {
        ...props.schemaType.options,
        list: loading
          ? [{ title: "Loading roles...", value: "" }]
          : !departmentRef
            ? [{ title: "Please select a department first", value: "" }]
            : roleOptions.length === 0
              ? [{ title: "No roles found for this department", value: "" }]
              : roleOptions,
      },
    },
  });
};

export default CustomRoleInput;
