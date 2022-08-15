import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import type { Bot } from "./bot";

export type Handler<T = unknown> = (
    interaction: CommandInteraction,
    bot: Bot<T>,
) => Promise<void> | void;

export class Command<T = unknown> extends SlashCommandBuilder {
    public handler: Handler<T> = () => undefined;

    constructor(name: string, description: string) {
        super();
        this.setName(name);
        this.setDescription(description);
    }

    public handle(handler: Handler<T>): this {
        this.handler = handler;
        return this;
    }

    public match(interaction: CommandInteraction): boolean {
        return interaction.commandName === this.name;
    }
}
