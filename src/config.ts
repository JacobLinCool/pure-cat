import path from "node:path";
import { config } from "dotenv";

config();

export const STORAGE = process.env.STORAGE || path.resolve(__dirname, "../storage");

if (!process.env.BOT_TOKEN) {
    throw new Error("BOT_TOKEN is not defined");
}
export const BOT_TOKEN = process.env.BOT_TOKEN;

if (!process.env.BOT_ID) {
    throw new Error("BOT_ID is not defined");
}
export const BOT_ID = process.env.BOT_ID;
