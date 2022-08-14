import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, Interaction } from "discord.js";
import { Module, Command, Logger } from "pure-cat";

const dump = new Command(
    "log-dump",
    'Dumps the log to a file and send it to channel "pure-logger".',
).handle(async (interaction, logger) => {
    const guild = interaction.guild;
    if (!guild) {
        return;
    }

    if (logger.dumpable(guild)) {
        await interaction.reply(`Preparing to dump log ...`);
        try {
            await logger.dump(guild);
            logger.log(guild, { actor: interaction.user.username, message: `log dumped.` });
            await interaction.editReply(`Log dumped.`);
        } catch (err) {
            await interaction.editReply(`Failed to dump log: ${err}`);
        }
    } else {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("create-pure-logger")
                .setLabel('Create Channel "Pure Logger"')
                .setStyle(ButtonStyle.Primary),
        );

        await interaction.reply({
            ephemeral: true,
            content: `Channel "pure-logger" doesn't exist on this server.`,
            components: [row],
        });
    }
});

export class LoggerControl implements Module {
    public commands = [dump];
    public async interactionCreate(
        client: Client,
        logger: Logger,
        interaction: Interaction,
    ): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        if (logger.dumpable(guild) === true) {
            await interaction.reply({
                ephemeral: true,
                content: `Channel "pure-logger" already exists on this server.`,
            });
            return;
        }

        if (interaction.customId === "create-pure-logger") {
            await interaction.reply(`Creating channel "pure-logger" ...`);
            try {
                await guild.channels.create({ name: "pure-logger" });
                await interaction.editReply(`Channel "pure-logger" created.`);
            } catch (err) {
                await interaction.editReply(
                    `Failed to create channel "pure-logger": ${(err as Error).message}`,
                );
            }
        }
    }
}
