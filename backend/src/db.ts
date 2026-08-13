// NOTE: loaded via require so the code type-checks before `prisma generate`
// has ever run. Once the project is running locally, Claude Code may replace
// this with a normal typed import:  import { PrismaClient } from "@prisma/client"
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: any = new PrismaClient();
