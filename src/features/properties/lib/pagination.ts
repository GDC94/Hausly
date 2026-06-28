/**
 * Tamaño de lote del listado **"Cargar más"** (specs/FILTERS.md §4/§5). Cada lote
 * suma `PAGE_SIZE` propiedades; múltiplo del grid (2/3 col) para no dejar filas
 * huérfanas. Con <20 propiedades de lanzamiento el botón casi no aparece, pero el
 * patrón queda listo para crecer (specs/ARCHITECTURE.md §4).
 */
export const PAGE_SIZE = 24
