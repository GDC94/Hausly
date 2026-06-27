import type { SchemaTypeDefinition } from "sanity"
import { agency } from "./documents/agency"
import { lead } from "./documents/lead"
import { property } from "./documents/property"
import { zone } from "./documents/zone"
import { location } from "./objects/location"
import { operation } from "./objects/operation"
import { price } from "./objects/price"

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  property,
  zone,
  agency,
  lead,
  // Objects (no-document)
  operation,
  price,
  location,
]
