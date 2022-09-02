import {
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import type { Bot } from "./bot";

export type Handler<T extends Record<string, unknown> = Record<string, unknown>> = (
    interaction: ChatInputCommandInteraction,
    bot: Bot<T>,
) => Promise<void> | void;

export class Command<
    T extends Record<string, unknown> = Record<string, unknown>,
> extends SlashCommandBuilder {
    public handler: Handler<T> = () => undefined;
    public subcommands: Subcommand[] = [];

    constructor(name: string, description: string) {
        super();
        this.setName(name);
        this.setDescription(description);
    }

    public handle(handler: Handler<T>): this {
        this.handler = handler;
        return this;
    }

    public match(interaction: ChatInputCommandInteraction): boolean {
        return interaction.commandName === this.name;
    }

    public addSubcommand(builder: () => Subcommand): this {
        const sub = builder();
        super.addSubcommand(sub);
        this.subcommands.push(sub);
        return this;
    }
}

export class Subcommand<
    T extends Record<string, unknown> = Record<string, unknown>,
> extends SlashCommandSubcommandBuilder {
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

    public match(interaction: ChatInputCommandInteraction): boolean {
        return interaction.options.getSubcommand() === this.name;
    }
}
