const EVENT_SECTIONS = new Set([
  "",
  "/panitia",
  "/panitia/divisions",
  "/panitia/committee",
  "/rundown",
  "/rundown/all",
  "/tugas",
  "/tugas/all",
  "/pengadaan",
  "/pengadaan/all",
  "/keuangan",
  "/keuangan/categories",
  "/keuangan/transactions",
  "/keuangan/commitments",
  "/ekspor",
]);

// Redirect hanya boleh kembali ke halaman dalam event yang sama.
// Nilai return_to berasal dari hidden input, jadi tetap divalidasi di server.
export function getEventReturnPath(eventId, formData) {
  const basePath = `/events/${eventId}`;
  const requestedPath = String(formData.get("return_to") || "");
  const belongsToEvent =
    requestedPath === basePath || requestedPath.startsWith(`${basePath}/`);

  if (!belongsToEvent) return basePath;

  const suffix = requestedPath.slice(basePath.length);
  return EVENT_SECTIONS.has(suffix) ? requestedPath : basePath;
}
