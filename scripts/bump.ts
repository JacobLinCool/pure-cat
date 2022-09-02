import fs from "node:fs";
import path from "node:path";

const TYPES = ["major", "minor", "patch"];
const type = process.argv[2];
if (!TYPES.includes(type)) {
    console.error(`Invalid type: ${type}, must be one of ${TYPES.join(", ")}`);
    process.exit(1);
}

const packages = fs.readdirSync(path.resolve(process.cwd(), "packages"));
const version = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "packages", "core", "package.json"), "utf8"),
).version as string;

const [major, minor, patch] = version.split(".");
const new_version =
    type === "major"
        ? `${parseInt(major) + 1}.0.0`
        : type === "minor"
        ? `${major}.${parseInt(minor) + 1}.0`
        : `${major}.${minor}.${parseInt(patch) + 1}`;

const bumped: string[] = [];
for (const p of packages) {
    const file = path.resolve(process.cwd(), "packages", p, "package.json");

    if (fs.existsSync(file)) {
        const data = JSON.parse(fs.readFileSync(file, "utf8"));
        if (data.version) {
            data.version = new_version;
            fs.writeFileSync(file, JSON.stringify(data, null, 4), "utf8");
            bumped.push(data.name);
        }
    }
}

console.log(
    `Bumped following packages from ${version} to ${new_version}: \n- ${bumped.join("\n- ")}`,
);
