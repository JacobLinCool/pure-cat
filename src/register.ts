/**
 * This is used to register all the commands.
 */
import { Bot } from "pure-cat";
import { DNS } from "./module/dns";
import { LoggerControl } from "./module/logger-control";
import { Click } from "./module/click";
import { Welcome } from "./module/welcome";
import { BOT_ID, STORAGE, BOT_TOKEN } from "./config";

new Bot(BOT_ID, STORAGE)
    .use(new DNS())
    .use(new LoggerControl())
    .use(new Click())
    .use(new Welcome())
    .register(BOT_TOKEN);
