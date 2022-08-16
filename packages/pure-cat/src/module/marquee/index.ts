import { ActivityType } from "discord.js";
import { Bot, Module } from "pure-cat";

export class Marquee extends Module {
    constructor(private contents: string[], private inverval = 5_000, bot?: Bot) {
        super(bot);
    }

    public async ready(bot: Bot): Promise<void> {
        let idx = 0;
        setInterval(() => {
            if (bot.client.user) {
                bot.client.user.setActivity(this.contents[idx], { type: ActivityType.Playing });
                idx = (idx + 1) % this.contents.length;
            }
        }, this.inverval);
    }
}
