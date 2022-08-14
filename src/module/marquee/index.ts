import { ActivityType, Client } from "discord.js";
import { Module } from "pure-cat";

export class Marquee implements Module {
    constructor(private contents: string[], private inverval = 5_000) {}

    public ready(client: Client): void {
        let idx = 0;
        setInterval(() => {
            if (client.user) {
                client.user.setActivity(this.contents[idx], { type: ActivityType.Playing });
                idx = (idx + 1) % this.contents.length;
            }
        }, this.inverval);
    }
}
