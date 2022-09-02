import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import { Collection } from "file-mapping";
import { Logger } from "./logger";
import { Module } from "./module";
import { PrismaClient } from "./prisma-client";

export class Bot<T extends Record<string, unknown> = Record<string, unknown>> {
    public id?: string;
    public logger: Logger;
    public client: Client;
    public modules: Module[] = [];
    public storage: string;
    public store: Collection<T>;
    public db: PrismaClient;

    constructor({
        id = undefined,
        storage = process.cwd(),
        base = {} as T,
        intents = Object.values(GatewayIntentBits).filter(
            (v) => typeof v !== "string",
        ) as GatewayIntentBits[],
    }: BotOptions<T> = {}) {
        this.id = id;
        this.storage = storage;
        this.client = new Client({ intents });
        this.store = new Collection(storage, base);
        this.db = new PrismaClient();
        this.logger = new Logger(this.db);

        this.ready();
        this.guildCreate();
        this.guildMemberAdd();
        this.messageCreate();
        this.interactionCreate();
    }

    private ready(): void {
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
    }

    private guildCreate(): void {
        this.client.on("guildCreate", async (guild) => {
            try {
                await this.db.server.upsert({
                    where: { discordId: guild.id },
                    update: { discordId: guild.id, discordName: guild.name },
                    create: { discordId: guild.id, discordName: guild.name },
                });
                this.logger.sys({
                    message: `Server ${guild.name} (${guild.id}) has been added to the database.`,
                });
            } catch (error) {
                this.logger.sys({ message: `Failed to add server to database. ${error}` });
            }

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
    }

    private guildMemberAdd(): void {
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

    private messageCreate(): void {
        this.client.on("messageCreate", async (message) => {
            if (!message.guild) {
                return;
            }

            if (message.author.bot) {
                return;
            }

            for (const module of this.modules) {
                try {
                    await module.messageCreate?.(this, message);
                } catch (error) {
                    this.logger.log(message.guild, {
                        message: `Error handling message. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });
    }

    private interactionCreate(): void {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.guild) {
                return;
            }

            if (interaction.isChatInputCommand()) {
                for (const module of this.modules) {
                    if (module.commands?.length) {
                        try {
                            for (const command of module.commands) {
                                if (command.match(interaction)) {
                                    const subcommand = command.subcommands.find((c) =>
                                        c.match(interaction),
                                    );
                                    if (subcommand) {
                                        await subcommand.handler(interaction, this);
                                    } else {
                                        await command.handler(interaction, this);
                                    }
                                }
                            }
                        } catch (error) {
                            this.logger.log(interaction.guild, {
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
                    this.logger.log(interaction.guild, {
                        message: `Error handling interaction. (${module.constructor.name}) ${error}`,
                    });
                }
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public use(module: Module<any>): this {
        module.init?.(this);
        this.modules.push(module);
        return this;
    }

    public async login(token: string): Promise<string> {
        try {
            await this.db.$connect();
            const [servers, users] = await Promise.all([
                this.db.server.count(),
                this.db.user.count(),
            ]);
            this.logger.sys({
                message: `Database successfully connected. Serving ${servers} servers with ${users} users.`,
            });
        } catch (error) {
            this.logger.sys({ message: `Database connected failed. ${error}` });
        }

        return this.client.login(token);
    }

    public async register(token: string): Promise<boolean> {
        if (!this.id) {
            throw new Error("Bot id is not set");
        }

        const rest = new REST({ version: "10" }).setToken(token);

        const commands = this.modules
            .map((module) => module.commands?.map((c) => c.toJSON()) || [])
            .flat();

        try {
            this.logger.sys({ message: "Updating application (/) commands." });

            await rest.put(Routes.applicationCommands(this.id), { body: commands });

            this.logger.sys({ message: `${commands.length} application (/) commands updated.` });
            return true;
        } catch (error) {
            this.logger.sys({ message: `Failed refreshing application (/) commands. ${error}` });
            return false;
        }
    }
}

export interface BotOptions<T extends Record<string, unknown>> {
    /** The bot ID (application ID) */
    id?: string;
    /** The storage directory */
    storage?: string;
    /** The base data of each guild */
    base?: T;
    /** The intents of the bot to use */
    intents?: GatewayIntentBits[];
}
