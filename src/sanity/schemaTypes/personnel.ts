import { defineField, defineType } from "sanity";

export const personnel = defineType({
  name: "personnel",
  type: "document",
  title: "Personnel",
  fields: [
    defineField({
      name: "fullName",
      type: "string",
      title: "Full Name",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "roleSet",
      title: "Role Set",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Technician", value: "technician" },
          { title: "Supervisor", value: "supervisor" },
          { title: "Manager", value: "manager" },
          { title: "Signatory", value: "signatory" },
        ],
      },
    }),

    defineField({
      name: "email",
      type: "email",
      title: "Email",
    }),
    defineField({
      name: "phone",
      type: "string",
      title: "Phone Number",
    }),
    // let's have a category of departments
    defineField({
      name: "departments",
      title: "Departments",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Sales", value: "sales" },
          { title: "Engineering", value: "engineering" },
          { title: "Administration", value: "administration" },
          { title: "Finance", value: "finance" },
          { title: "Marketing", value: "marketing" },
          { title: "Customer Service", value: "customer-service" },
          { title: "Human Resources", value: "human-resources" },
          { title: "Legal", value: "legal" },
        ],
      },
    }),
    // Connect to projects
    defineField({
      name: "projects",
      type: "reference",
      to: [{ type: "project" }],
    }),
  ],
});
// // ADMIN DOES BELOW
// WHO CREATES PERSONNEL?
// WHO UPDATES PERSONNEL?
// WHO DELETES PERSONNEL?
// WHO CAN VIEW PERSONNEL?

// // TECH MANAGER --> SENIOR LAB ENG --> LAB ENG --> LAB TECHS
// WHO CAN ASSIGN PERSONNEL TO PROJECTS?
// WHO CAN UPDATE PERSONNEL IN A PROJECT?
// WHO CAN DELETE PERSONNEL FROM A PROJECT?
// WHO CAN VIEW PERSONNEL IN A PROJECT?

// // SHOW CURRENT CAPACITY OF LAB TECH

// // ADMINS
// WHO CAN CREATE PROJECTS?
// WHO CAN UPDATE PROJECTS?
// WHO CAN DELETE PROJECTS?
// WHO CAN VIEW PROJECTS?
