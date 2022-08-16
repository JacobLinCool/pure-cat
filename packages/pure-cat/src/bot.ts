/**
 * Invite link: https://discord.com/api/oauth2/authorize?client_id=1008351564299243521&permissions=8&scope=bot%20applications.commands
 */
import { Bot } from "pure-cat";
import { DNS } from "pure-cat-module-dns";
import { EventLog } from "pure-cat-module-event-log";
import { Marquee } from "pure-cat-module-marquee";
import { Welcome } from "pure-cat-module-welcome";
import { LoggerControl } from "pure-cat-module-logger-control";
import { Click } from "pure-cat-module-click";
import { BOT_ID, STORAGE } from "./config";

export const bot = new Bot(BOT_ID, STORAGE)
    .use(new EventLog())
    .use(new Marquee(["/log-dump", "/dns"]))
    .use(new DNS())
    .use(new LoggerControl())
    .use(new Click())
    .use(new Welcome());
