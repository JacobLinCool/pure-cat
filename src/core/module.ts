/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Message, Interaction, Guild } from "discord.js";
import type { Command } from "./command";
import type { Bot } from "./bot";

export class Module<T = unknown> {
    public bot?: Bot<T>;
    public commands?: Command[];

    constructor(bot?: Bot<T>) {
        this.bot = bot;
    }

    init(bot: Bot<T>): void {
        bot.logger.sys({ message: `Module ${this.constructor.name} initialized.` });
    }

    async ready(bot: Bot<T>): Promise<void> {
        return;
    }

    async guildCreate(bot: Bot<T>, guild: Guild): Promise<void> {
        return;
    }

    async messageCreate(bot: Bot<T>, message: Message): Promise<void> {
        return;
    }

    async interactionCreate(bot: Bot<T>, interaction: Interaction): Promise<void> {
        return;
    }
}
