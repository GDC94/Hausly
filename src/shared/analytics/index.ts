// Barrel CLIENTE-safe de analytics. El adapter server-side (`posthog-node`) vive en
// `./server` y se importa aparte: NO se re-exporta acá para no arrastrar código de
// servidor a bundles de cliente.
export { capture, getDistinctId } from "./capture"
export { denyConsent, grantConsent, hasConsent, hasDecidedConsent } from "./consent"
export { ANALYTICS_EVENTS, type AnalyticsEvent, type Operation } from "./events"
export { PageviewTracker } from "./pageview-tracker"
export { toPriceBucket } from "./price-bucket"
export { WhatsAppTelemetry } from "./whatsapp-telemetry"
