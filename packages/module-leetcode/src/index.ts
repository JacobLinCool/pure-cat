import { Module, Command, Bot } from "pure-cat";
import { Message } from "discord.js";
import { query } from "./query";

const THEMES = ["light", "dark", "nord", "forest", "unicorn"];

const command = new Command("leetcode", "Query user's leetcode stats")
    .addStringOption((option) =>
        option
            .setName("username")
            .setDescription("The username of the user to query")
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("theme")
            .setDescription("Card theme")
            .addChoices(...THEMES.map((name) => ({ name, value: name })))
            .setRequired(false),
    )
    .handle(async (interaction) => {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        const username = interaction.options.get("username", true).value as string;
        const theme = (interaction.options.get("theme", false)?.value || "unicorn") as string;

        const result = query(username, theme).catch(() => null);
        await interaction.reply(`Looking up leetcode stats card of ${username} ...`);
        const img = await result;
        if (img) {
            await interaction.editReply({
                content: `${username}'s leetcode stats card`,
                files: [{ attachment: img, name: `${username}-leetcode.png` }],
            });
        } else {
            await interaction.editReply(`Failed to find user "${username}"`);
        }
    });

export class LeetCode extends Module {
    public commands: Command[] = [];
    private triggers: RegExp[] = [];

    constructor(
        { slash = true, triggers = [/!leetcode ([^\s]+)\s*([^\s]*)/] }: Partial<Option> = {},
        bot?: Bot,
    ) {
        super(bot);

        if (slash) {
            this.commands.push(command);
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

        const guild = message.guild;

        if (matched && guild) {
            const username = matched[1];
            const theme = matched[2] || "unicorn";

            const result = query(username, theme).catch((err) => (err as Error).message);
            const reply = await message.reply(`Looking up leetcode stats card of ${username} ...`);
            const img = await result;
            if (typeof img !== "string") {
                await reply.edit({
                    files: [{ attachment: img, name: `${username}-leetcode.png` }],
                });
            } else {
                await reply.edit(`Failed to find user "${username}"`);
            }
        }
    }
}

export interface Option {
    /**
     * Enable slash command?
     * (default: true)
     */
    slash: boolean;
    /**
     * List of triggers to match (for normal messages)
     * (default: [`/!leetcode ([^\s]+)\s*([^\s]*)/`])
     */
    triggers: RegExp[];
}
