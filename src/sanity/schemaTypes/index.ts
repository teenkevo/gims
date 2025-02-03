import { type SchemaTypeDefinition } from "sanity";
import { projectType } from "./projectType";
import { clientType } from "./clientType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [projectType, clientType],
};
