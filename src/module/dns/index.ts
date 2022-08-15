import { Module, Command, Bot } from "pure-cat";
import fetch from "node-fetch";
import { Message } from "discord.js";

const resolvers = {
    Google: "https://dns.google.com/resolve",
    Cloudflare: "https://cloudflare-dns.com/dns-query",
} as const;

const record_types = ["A", "AAAA", "CNAME", "MX", "NS", "PTR", "SRV", "TXT"] as const;

async function lookup(domain: string, type: string, resolver: keyof typeof resolvers) {
    const url = `${resolvers[resolver]}?name=${domain}${type ? `&type=${type}` : ""}`;
    const res = fetch(url, { headers: { accept: "application/dns-json" } });
    const json = await res.then((r) => r.json());
    return json.Answer;
}

const command = new Command("dns", "Look up a DNS record")
    .addStringOption((option) =>
        option.setName("domain").setDescription("The domain to look up").setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("The type of record to look up")
            .addChoices(...record_types.map((name) => ({ name, value: name })))
            .setRequired(false),
    )
    .addStringOption((option) =>
        option
            .setName("resolver")
            .setDescription("The resolver to use")
            .addChoices(...Object.keys(resolvers).map((name) => ({ name, value: name })))
            .setRequired(false),
    )
    .handle(async (interaction) => {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        const domain = interaction.options.get("domain", true).value as string;
        const type = (interaction.options.get("type", false)?.value || "") as string;
        const resolver = (interaction.options.get("resolver", false)?.value ||
            "Cloudflare") as keyof typeof resolvers;

        const result = lookup(domain, type, resolver);
        await interaction.reply(`Using ${resolver} to look up ${type} records for ${domain} ...`);
        try {
            await interaction.editReply(
                "```json\n" +
                    JSON.stringify((await result) || `No results for ${domain}`, null, 4) +
                    "\n```",
            );
        } catch (err) {
            await interaction.editReply(`Failed to look up ${domain} ${err}`);
        }
    });

export class DNS extends Module {
    public commands: Command[] = [];
    private triggers: RegExp[] = [];

    constructor(
        { slash = true, triggers = [/!dns ([^\s]+)\s*([^\s]*)\s*([^\s]*)/] }: Partial<Option> = {},
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
            const domain = matched[1];
            const type = matched[2];
            const resolver = (
                Object.keys(resolvers).includes(matched[3]) ? matched[3] : "Cloudflare"
            ) as keyof typeof resolvers;

            const result = lookup(domain, type, resolver);
            const reply = await message.reply(
                `Using ${resolver} to look up ${type} records for ${domain} ...`,
            );
            try {
                await reply.edit(
                    "```json\n" +
                        JSON.stringify((await result) || `No results for ${domain}`, null, 4) +
                        "\n```",
                );
            } catch (err) {
                await reply.edit(`Failed to look up ${domain} ${err}`);
            }
        }
    }
}

interface Option {
    /**
     * Enable slash command?
     * (default: true)
     */
    slash: boolean;
    /**
     * List of triggers to match (for normal messages)
     * (default: [`/!dns ([^\s]+)\s*([^\s]*)\s*([^\s]*)/`])
     */
    triggers: RegExp[];
}
