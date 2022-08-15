import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { Collection } from "file-mapping";
import { Logger } from "./logger";
import { Module } from "./module";

export class Bot<T = unknown> {
    public id: string;
    public logger: Logger;
    public client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.DirectMessageReactions,
        ],
    });
    public modules: Module[] = [];
    public store: Collection<T>;

    constructor(bot_id: string, storage: string, base_data?: T) {
        this.id = bot_id;
        this.logger = new Logger(storage);
        this.store = new Collection(storage, base_data);

        this.client.once("ready", async () => {
            for (const module of this.modules) {
                try {
                    await module.ready?.(this);
                } catch (error) {
                    this.logger.sys({
                        message: `Error handling ready. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });

        this.client.on("guildCreate", async (guild) => {
            for (const module of this.modules) {
                try {
                    await module.guildCreate?.(this, guild);
                } catch (error) {
                    this.logger.log(guild, {
                        message: `Error handling guildCreate. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });

        this.client.on("messageCreate", async (message) => {
            const guild = message.guild;
            if (!guild) {
                return;
            }

            if (message.author.bot) {
                return;
            }

            for (const module of this.modules) {
                try {
                    await module.messageCreate?.(this, message);
                } catch (error) {
                    this.logger.log(guild, {
                        message: `Error handling message. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });

        this.client.on("interactionCreate", async (interaction) => {
            const guild = interaction.guild;
            if (!guild) {
                return;
            }

            if (interaction.isChatInputCommand()) {
                for (const module of this.modules) {
                    if (module.commands?.length) {
                        try {
                            for (const command of module.commands) {
                                if (command.match(interaction)) {
                                    await command.handler(interaction, this);
                                }
                            }
                        } catch (error) {
                            this.logger.log(guild, {
                                message: `Error handling command. (${module.constructor.name}) ${error}`,
                            });
                        }
                    }
                }
            }

            for (const module of this.modules) {
                try {
                    await module.interactionCreate?.(this, interaction);
                } catch (error) {
                    this.logger.log(guild, {
                        message: `Error handling interaction. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });

        this.client.on("guildMemberAdd", async (member) => {
            for (const module of this.modules) {
                try {
                    await module.guildMemberAdd?.(this, member);
                } catch (error) {
                    this.logger.log(member.guild, {
                        message: `Error handling memberAdd. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });
    }

    public use(module: Module<any>): this {
        module.init?.(this);
        this.modules.push(module);
        return this;
    }

    public login(token: string): this {
        this.client.login(token);
        return this;
    }

    public async register(token: string): Promise<void> {
        const rest = new REST({ version: "10" }).setToken(token);

        const commands = this.modules
            .map((module) => module.commands?.map((c) => c.toJSON()) || [])
            .flat();

        try {
            this.logger.sys({ message: "Updating application (/) commands." });

            await rest.put(Routes.applicationCommands(this.id), { body: commands });

            this.logger.sys({ message: `${commands.length} application (/) commands updated.` });
        } catch (error) {
            this.logger.sys({ message: `Failed refreshing application (/) commands. ${error}` });
        }
    }
}
