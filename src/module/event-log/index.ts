import { Client, Guild, Interaction, Message, TextChannel } from "discord.js";
import { Logger, Module } from "pure-cat";

export class EventLog implements Module {
    public async ready(client: Client, logger: Logger): Promise<void> {
        return logger.sys({ message: { on: "ready" } });
    }

    public async guildCreate(client: Client, logger: Logger, guild: Guild): Promise<void> {
        return logger.sys({ message: { on: "guildCreate", guild } });
    }

    public async messageCreate(client: Client, logger: Logger, message: Message): Promise<void> {
        const guild = message.guild;
        if (!guild) {
            return;
        }

        if (message.channel instanceof TextChannel) {
            return logger.log(guild, {
                actor: message.author.username,
                message: {
                    channel: message.channel.name,
                    content: message.content,
                    attachments: message.attachments.map((a) => a.url),
                },
            });
        }
    }

    public async interactionCreate(
        client: Client,
        logger: Logger,
        interaction: Interaction,
    ): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        if (interaction.isCommand()) {
            return logger.log(guild, {
                actor: interaction.user.username,
                message: { command: interaction.commandName, options: interaction.options },
            });
        }
    }
}
