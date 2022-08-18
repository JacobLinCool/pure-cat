import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { Command, Subcommand } from "pure-cat";
import type { Subscription } from "./subscription";

export function get_commands(self: Subscription): Command[] {
    return [
        new Command("subscription", "Subscription commands")
            .addSubcommand(() =>
                new Subcommand("list", "List all subscriptions for this server.").handle(
                    async (interaction) => {
                        const guild = interaction.guild;
                        if (!guild) {
                            await interaction.reply("This command can only be used in a server.");
                            return;
                        }

                        const subs = self.subscriptions(guild.id);
                        const msg = self._subscriptions
                            .map(
                                (sub) =>
                                    `**${sub}**\n\n${
                                        subs[sub]
                                            ? `:green_circle: ${new Date(subs[sub]).toString()}`
                                            : ":x:"
                                    }\n`,
                            )
                            .join("\n");
                        await interaction.reply({
                            embeds: [
                                {
                                    title: `Subscriptions for **${guild.name}**`,
                                    description: msg,
                                },
                            ],
                        });
                    },
                ),
            )
            .addSubcommand(() =>
                new Subcommand("redeem", "Redeem a code.")
                    .addStringOption((option) =>
                        option.setName("code").setDescription("redeem code").setRequired(true),
                    )
                    .handle(async (interaction) => {
                        const guild = interaction.guild;
                        if (!guild) {
                            await interaction.reply("This command can only be used in a server.");
                            return;
                        }

                        const code = interaction.options.getString("code", true);

                        const token = self.token(code);

                        if (!token) {
                            await interaction.reply(`Invalid code: ${code}`);
                            return;
                        } else {
                            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`redeem-code-${code}`)
                                    .setLabel("Redeem")
                                    .setStyle(ButtonStyle.Primary),
                            );

                            await interaction.reply({
                                content: `Redeem code **${code}** to get **${token.type}** subscription for **${token.days}** days?`,
                                components: [row],
                            });
                        }
                    }),
            ),
    ];
}
