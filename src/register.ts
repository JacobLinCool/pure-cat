/**
 * This is used to register all the commands.
 */
import { Bot } from "pure-cat";
import { DNS } from "./module/dns";
import { LoggerControl } from "./module/logger-control";
import { BOT_ID, STORAGE, BOT_TOKEN } from "./config";

new Bot(BOT_ID, STORAGE).use(new DNS()).use(new LoggerControl()).register(BOT_TOKEN);
