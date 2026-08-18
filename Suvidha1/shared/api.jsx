// Compatibility barrel.
//
// The axios instance moved to services/http.js and the constants moved to
// data/services.js and ui/theme.js. This file re-exports them so the older
// default-import call sites keep working.

import { authApi } from "./services/http";

export default authApi;

export { THEME } from "./ui/theme";
export { SERVICES, getCategoryBySlug } from "./data/services";
