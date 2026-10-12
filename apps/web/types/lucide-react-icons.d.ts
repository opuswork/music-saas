/**
 * Per-icon imports from lucide-react/dist/esm/icons/*.js (barrel bypass).
 * lucide-react ships typings only for the main entry, not these subpaths.
 */
declare module "lucide-react/dist/esm/icons/*.js" {
  import type { LucideIcon } from "lucide-react";
  const Icon: LucideIcon;
  export default Icon;
}
