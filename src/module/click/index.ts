import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Message,
    CommandInteraction,
    Interaction,
} from "discord.js";
import { Bot, Command, Module } from "pure-cat";

const BUTTON_ID = "click-button";

const click_command = new Command("click", "Summon a click button").handle(summon);

export class Click extends Module {
    public commands: Command[] = [];
    private triggers: RegExp[] = [];

    constructor({ slash = true, triggers = [/^!click$/] }: Partial<Option> = {}, bot?: Bot) {
        super(bot);

        if (slash) {
            this.commands.push(click_command);
        }

        this.triggers = triggers;
    }

    public async messageCreate(bot: Bot, message: Message): Promise<void> {
        let matched: RegExpExecArray | null = null;
        for (const trigger of this.triggers) {
            matched = trigger.exec(message.content);
            if (matched) {
                break;
            }
        }

        if (matched) {
            await summon(message);
        }
    }

    public async interactionCreate(
        bot: Bot<{ clicks: Record<string, number> }>,
        interaction: Interaction,
    ): Promise<void> {
        if (!interaction.isButton() || !interaction.guild || interaction.customId !== BUTTON_ID) {
            return;
        }

        const data = bot.store.data(interaction.guild.id);
        if (!data.clicks) {
            data.clicks = {};
        }

        if (!data.clicks[interaction.user.id]) {
            data.clicks[interaction.user.id] = 0;
        }

        data.clicks[interaction.user.id]++;

        const total = Object.values(data.clicks).reduce((a, b) => a + b, 0);

        await interaction.update(
            [
                `**${interaction.user.username}** clicked **${
                    data.clicks[interaction.user.id]
                }** times in this server.`,
                `Total clicks: **${total}**`,
            ].join("\n"),
        );
    }
}

async function summon(msg: Message | CommandInteraction) {
    const guild = msg.guild;
    if (!guild) {
        return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(BUTTON_ID).setLabel("Click!").setStyle(ButtonStyle.Primary),
    );

    const username = msg instanceof Message ? msg.author.username : msg.user.username;

    await msg.reply({ content: `${username} summoned a click button!`, components: [row] });
}

interface Option {
    /**
     * Enable slash command?
     * (default: true)
     */
    slash: boolean;
    /**
     * List of triggers to match (for normal messages)
     * (default: [`/^!click$/`])
     */
    triggers: RegExp[];
}
