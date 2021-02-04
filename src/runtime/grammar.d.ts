declare module "*.grammar" {
  import type { Parser } from "lezer"
  export const parser: Parser
}