import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { Logger } from "./logger";
import { Module } from "./types";

export class Bot {
    public id: string;
    public logger: Logger;
    public client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildIntegrations,
            GatewayIntentBits.GuildPresences,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
        ],
    });
    public modules: Module[] = [];

    constructor(bot_id: string, storage: string) {
        this.id = bot_id;
        this.logger = new Logger(storage);

        this.client.once("ready", async () => {
            for (const module of this.modules) {
                try {
                    await module.ready?.(this.client, this.logger);
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
                    await module.guildCreate?.(this.client, this.logger, guild);
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
                    await module.messageCreate?.(this.client, this.logger, message);
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

            for (const module of this.modules) {
                try {
                    await module.interactionCreate?.(this.client, this.logger, interaction);
                } catch (error) {
                    this.logger.log(guild, {
                        message: `Error handling interaction. (${module.constructor.name}) ${error}`,
                    });
                }
            }

            if (interaction.isChatInputCommand()) {
                for (const module of this.modules) {
                    if (module.commands?.length) {
                        try {
                            for (const command of module.commands) {
                                if (command.match(interaction)) {
                                    await command.handler(interaction, this.logger);
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
        });
    }

    public use(module: Module): this {
        module.init?.(this.client, this.logger);
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
