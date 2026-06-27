import { CaseIcon, EnvelopeIcon, HomeIcon, PinIcon } from "@sanity/icons"
import type { StructureResolver } from "sanity/structure"

// agency es singleton: se edita un único documento de id fijo "agency"; el desk
// no ofrece "crear nuevo" (eso se completa con document.newDocumentOptions/actions
// en sanity.config.ts).
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.documentTypeListItem("property").title("Propiedades").icon(HomeIcon),
      S.documentTypeListItem("zone").title("Zonas").icon(PinIcon),
      S.divider(),
      S.listItem()
        .title("Inmobiliaria")
        .id("agency")
        .icon(CaseIcon)
        .child(S.document().schemaType("agency").documentId("agency")),
      S.divider(),
      S.documentTypeListItem("lead").title("Consultas").icon(EnvelopeIcon),
    ])
