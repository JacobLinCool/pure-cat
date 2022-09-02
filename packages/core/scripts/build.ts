import fs from "node:fs";
import { execSync } from "node:child_process";

execSync(
    "prisma generate && prisma-runtime --no-browser --no-package-json src/prisma-client && tsup",
    { stdio: "inherit" },
);
fs.cpSync("src/prisma-client/index.js", "dist/prisma-client/index.js");
fs.cpSync("src/prisma-client/schema.prisma", "dist/prisma-client/schema.prisma");
