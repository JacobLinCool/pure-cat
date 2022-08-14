import type { Client, Message, Interaction, Guild } from "discord.js";
import { Command } from "./command";
import type { Logger } from "./logger";

export interface Module {
    init?: (client: Client, logger: Logger) => void;
    ready?: (client: Client, logger: Logger) => Promise<void> | void;
    guildCreate?: (client: Client, logger: Logger, guild: Guild) => Promise<void> | void;
    messageCreate?: (client: Client, logger: Logger, message: Message) => Promise<void> | void;
    interactionCreate?: (
        client: Client,
        logger: Logger,
        interaction: Interaction,
    ) => Promise<void> | void;

    commands?: Command[];
}
