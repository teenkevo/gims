import { Search, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatePersonnelDialog } from "./create-personnel-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PersonnelSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  departmentRoles: Record<
    string,
    { roles: (string | undefined)[]; departmentId: string }
  >;
}

export function PersonnelSearch({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  departmentRoles,
}: PersonnelSearchProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search name"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={departmentFilter}
          onValueChange={onDepartmentFilterChange}
        >
          <SelectTrigger className="w-[180px] text-xs">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {Object.entries(departmentRoles).map(([key]) => {
              return (
                <SelectItem key={key} value={key}>
                  {key}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[150px] text-xs">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {/* Based on the departmentRoles, we need to show all the roles for the department */}
            {Object.entries(departmentRoles).map(([key, { roles }]) => {
              if (departmentFilter === key) {
                return roles.map((role) => {
                  return (
                    <SelectItem key={role} value={role || ""}>
                      {role}
                    </SelectItem>
                  );
                });
              }
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <Button
          onClick={() => setOpen(true)}
          className="text-sm flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Personnel
        </Button>
        <CreatePersonnelDialog
          departmentRoles={departmentRoles}
          open={open}
          onClose={handleCloseDialog}
        />
      </div>
    </div>
  );
}
