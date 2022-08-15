import { Module, Command } from "pure-cat";
import fetch from "node-fetch";

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

export class DNS extends Module {
    public commands = [
        new Command("dns", "Look up a DNS record")
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
                await interaction.reply(
                    `Using ${resolver} to ooking up ${type} records for ${domain} ...`,
                );
                try {
                    await interaction.editReply(
                        "```json\n" +
                            JSON.stringify((await result) || `No results for ${domain}`, null, 4) +
                            "\n```",
                    );
                } catch (err) {
                    await interaction.editReply(`Failed to look up ${domain} ${err}`);
                }
            }),
    ];
}
