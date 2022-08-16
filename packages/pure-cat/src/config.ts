import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

load_env();

export const STORAGE = process.env.STORAGE || path.resolve(__dirname, "../storage");

if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN is not defined");
}
export const BOT_TOKEN = process.env.BOT_TOKEN;

if (!process.env.BOT_ID) {
    throw new Error("BOT_ID is not defined");
}
export const BOT_ID = process.env.BOT_ID;

/** load all .env files in the ancestor directories */
function load_env() {
    const dirs = process.cwd().split(path.sep);
    for (let i = 0; i < dirs.length; i++) {
        const file = path.join(dirs.slice(0, dirs.length - i).join(path.sep), ".env");
        if (fs.existsSync(file)) {
            config({ path: file });
        }
    }
}
