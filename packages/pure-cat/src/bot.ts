/**
 * Invite link: https://discord.com/api/oauth2/authorize?client_id=1008351564299243521&permissions=8&scope=bot%20applications.commands
 */
import fs from "node:fs";
import { Bot, stringify } from "pure-cat";
import { Subscription } from "pure-cat-module-subscription";
import { DNS } from "pure-cat-module-dns";
import { EventLog } from "pure-cat-module-event-log";
import { Marquee } from "pure-cat-module-marquee";
import { Welcome } from "pure-cat-module-welcome";
import { LoggerControl } from "pure-cat-module-logger-control";
import { Click } from "pure-cat-module-click";
import { LeetCode } from "pure-cat-module-leetcode";
import { BOT_ID, STORAGE } from "./config";

export const bot = new Bot({ id: BOT_ID, storage: STORAGE })
    .use(new Subscription({ subscriptions: ["free", "premium", "premium+"], base: "free" }))
    .use(new EventLog())
    .use(new Marquee(["/log-dump", "/dns", "/leetcode"]))
    .use(new DNS())
    .use(new LoggerControl())
    .use(new Click())
    .use(new LeetCode())
    .use(new Welcome());

bot.client.on("messageCreate", async (message) => {
    fs.writeFileSync("test.json", stringify(message.author));
});
