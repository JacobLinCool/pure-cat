import { Bot } from "pure-cat";
import { Marquee } from "./module/marquee";
import { EventLog } from "./module/event-log";
import { DNS } from "./module/dns";
import { LoggerControl } from "./module/logger-control";
import { BOT_ID, STORAGE, BOT_TOKEN } from "./config";

new Bot(BOT_ID, STORAGE)
    .use(new EventLog())
    .use(new Marquee(["/log-dump", "/dns"]))
    .use(new DNS())
    .use(new LoggerControl())
    .login(BOT_TOKEN);

// link: https://discord.com/api/oauth2/authorize?client_id=1008351564299243521&permissions=8&scope=bot%20applications.commands
