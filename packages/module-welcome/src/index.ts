import { GuildMember, MessageOptions } from "discord.js";
import { Bot, Command, Module } from "pure-cat";

export class Welcome extends Module<Storage> {
    private messages: (string | MessageOptions)[];

    constructor(
        { messages = ["Welcome <@${id}>! Nice to see you!"] }: Partial<Option> = {},
        bot?: Bot<Storage>,
    ) {
        super(bot);

        this.messages = messages;
    }

    public async guildMemberAdd(bot: Bot<Storage>, member: GuildMember): Promise<void> {
        const data = bot.store.data(member.guild.id);
        if (!data.welcome?.channel) {
            throw new Error("No welcome channel set.");
        }

        const chan = member.guild.channels.cache.get(data.welcome.channel);
        if (!chan || !chan.isTextBased()) {
            throw new Error("Welcome channel not exists.");
        }

        const message = this.messages[Math.floor(Math.random() * this.messages.length)];

        if (typeof message === "string") {
            await chan.send(inject_template(message, { ...member.user, guild: member.guild }));
        } else {
            if (message.content) {
                message.content = inject_template(message.content, {
                    ...member.user,
                    guild: member.guild,
                });
            }

            await chan.send(message);
        }
    }

    public commands = [
        new Command<Storage>(
            "set-welcome-channel",
            "Set the current channel as the welcome channel",
        ).handle(async (interaction, bot) => {
            const guild = interaction.guild;
            if (!guild) {
                throw new Error("This command can only be used in a guild.");
            }

            const chan = interaction.channel;
            if (!chan || !chan.isTextBased()) {
                throw new Error("Not a text channel");
            }

            bot.store.data(guild.id).welcome.channel = chan.id;

            await interaction.reply({
                ephemeral: true,
                content: "Welcome channel set.",
            });
        }),
    ];
}

function inject_template(template: string, vars: Record<string, unknown>): string {
    return new Function(...Object.keys(vars), "return `" + template.replace(/`/g, "\\`") + "`")(
        ...Object.values(vars),
    );
}

export interface Option {
    /**
     * Welcome messages. (Randomly picked)
     */
    messages: (string | MessageOptions)[];
}

export interface Storage {
    welcome: {
        channel: string;
        messages: (string | MessageOptions)[];
    };

    [key: string]: unknown;
}

export const WelcomeStorage: Storage = {
    welcome: {
        channel: "",
        messages: [],
    },
};
