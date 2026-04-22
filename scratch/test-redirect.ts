
import { getRoleRedirectPath } from "../src/lib/auth";

console.log("Testing getRoleRedirectPath:");
console.log("customer ->", getRoleRedirectPath("customer" as any));
console.log("employee ->", getRoleRedirectPath("employee" as any));
console.log("ceo ->", getRoleRedirectPath("ceo" as any));
console.log("agent ->", getRoleRedirectPath("agent" as any));
console.log("executive ->", getRoleRedirectPath("executive" as any));
console.log("null ->", getRoleRedirectPath(null));
