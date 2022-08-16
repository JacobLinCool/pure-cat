import { Guild, Interaction, Message, TextChannel } from "discord.js";
import { Bot, Module } from "pure-cat";

export class EventLog extends Module {
    public async ready(bot: Bot): Promise<void> {
        bot.logger.sys({ message: { event: "ready" } });
        return super.ready(bot);
    }

    public async guildCreate(bot: Bot, guild: Guild): Promise<void> {
        return bot.logger.sys({ message: { event: "guildCreate", guild } });
    }

    public async messageCreate(bot: Bot, message: Message): Promise<void> {
        const guild = message.guild;
        if (!guild) {
            return;
        }

        if (message.channel instanceof TextChannel) {
            return bot.logger.log(guild, {
                actor: message.author.username,
                message: {
                    event: "message",
                    channel: message.channel.name,
                    content: message.content,
                    attachments: message.attachments.map((a) => a.url),
                },
            });
        }
    }

    public async interactionCreate(bot: Bot, interaction: Interaction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        if (interaction.isCommand()) {
            return bot.logger.log(guild, {
                actor: interaction.user.username,
                message: {
                    event: "command",
                    command: interaction.commandName,
                    options: interaction.options,
                },
            });
        }
    }
}
