import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { projectType } from "./projectType";
import { clientType } from "./clientType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, projectType, clientType],
};
