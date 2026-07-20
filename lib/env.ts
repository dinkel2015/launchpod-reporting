// Trailing slashes in NEXT_PUBLIC_APP_URL produce double slashes wherever
// this is concatenated with a path (broken OAuth redirects, broken client
// report links), so strip one here rather than at every call site.
export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}
