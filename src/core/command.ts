import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Logger } from "./logger";

export type Handler = (interaction: CommandInteraction, logger: Logger) => Promise<void> | void;

export class Command extends SlashCommandBuilder {
    public handler: Handler = () => undefined;

    constructor(name: string, description: string) {
        super();
        this.setName(name);
        this.setDescription(description);
    }

    public handle(handler: Handler): this {
        this.handler = handler;
        return this;
    }

    public match(interaction: CommandInteraction): boolean {
        return interaction.commandName === this.name;
    }
}
