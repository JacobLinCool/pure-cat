import { Module, Command } from "pure-cat";
import fetch from "node-fetch";

const resolvers = {
    Google: "https://dns.google.com/resolve",
    Cloudflare: "https://cloudflare-dns.com/dns-query",
} as const;

const dns = new Command("dns", "Look up a DNS record")
    .addStringOption((option) =>
        option.setName("domain").setDescription("The domain to look up").setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("type")
            .setDescription("The type of record to look up")
            .addChoices(
                { name: "A", value: "A" },
                { name: "AAAA", value: "AAAA" },
                { name: "CNAME", value: "CNAME" },
                { name: "MX", value: "MX" },
                { name: "NS", value: "NS" },
                { name: "PTR", value: "PTR" },
                { name: "SRV", value: "SRV" },
                { name: "TXT", value: "TXT" },
            )
            .setRequired(false),
    )
    .addStringOption((option) =>
        option
            .setName("resolver")
            .setDescription("The resolver to use")
            .addChoices(...Object.keys(resolvers).map((name) => ({ name, value: name })))
            .setRequired(false),
    )
    .handle(async (interaction, logger) => {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        const domain = interaction.options.get("domain", true).value as string;
        const type = (interaction.options.get("type", false)?.value || "") as string;
        const resolver = (interaction.options.get("resolver", false)?.value ||
            "Cloudflare") as keyof typeof resolvers;

        logger.log(guild, {
            actor: interaction.user.username,
            message: `Looking up ${domain} ${type}`,
        });
        const url = `${resolvers[resolver]}?name=${domain}${type ? `&type=${type}` : ""}`;
        const res = fetch(url, { headers: { accept: "application/dns-json" } });
        await interaction.reply(`Using ${resolver} to ooking up ${type} records for ${domain} ...`);
        try {
            const json = await res.then((r) => r.json());
            await interaction.editReply(
                "```json\n" + JSON.stringify(json.Answer || "No Result.", null, 4) + "\n```",
            );
        } catch (err) {
            await interaction.editReply(`Failed to look up ${domain} ${err}`);
        }
    });

export class DNS implements Module {
    public commands = [dns];
}
