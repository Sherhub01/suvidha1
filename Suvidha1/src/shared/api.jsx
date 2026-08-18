// Compatibility barrel.
//
// The axios instance moved to services/http.js and the data/theme constants
// moved to data/services.js and components/ui/theme.js. This file re-exports
// them so existing `import API from "../api"` call sites keep working.

import { authApi } from "./services/http";

export default authApi;

export { THEME } from "./ui/theme";
export { SERVICES, getCategoryBySlug } from "./data/services";
