import { type SchemaTypeDefinition } from "sanity";
import { projectType } from "./projectType";
import { clientType } from "./clientType";
import { contactPersonType } from "./contactPersonType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, clientType, contactPersonType],
};
