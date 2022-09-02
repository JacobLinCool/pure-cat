import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { ChannelType, Guild } from "discord.js";
import { stringify } from "./utils";
import { PrismaClient } from "./prisma-client";

export class Logger {
    private db: PrismaClient;
    private capacity: number;
    private console: boolean;

    constructor(db: PrismaClient, { capacity = 1000, console = true } = {}) {
        this.db = db;
        this.capacity = capacity;
        this.console = console;
    }

    public async sys(payload: Partial<Log>): Promise<void> {
        const message =
            typeof payload.message === "string" ? payload.message : stringify(payload.message);

        await this.db.log.create({
            data: { server: "sys", actor: "sys", message },
        });

        this.console && console.log(payload);
    }

    public async log(guild: Guild, payload: Partial<Log>): Promise<void> {
        const message =
            typeof payload.message === "string" ? payload.message : stringify(payload.message);

        await this.db.log.create({
            data: { server: guild.name, actor: payload.actor || guild.name, message },
        });

        const count = await this.db.log.count({ where: { server: guild.name } });

        if (count > this.capacity) {
            if (this.dumpable(guild)) {
                await this.dump(guild);
            } else {
                (async () => {
                    const oldest = await this.db.log.findFirst({ where: { server: guild.name } });
                    if (oldest) {
                        await this.db.log.delete({ where: { id: oldest.id } });
                    }
                })();
            }
        }
    }

    public async dump(guild: Guild): Promise<boolean> {
        const chan = guild.channels.cache.find((c) => c.name === "pure-logger");

        if (chan && chan.type === ChannelType.GuildText) {
            const temp = path.resolve(os.tmpdir(), `pure-${guild.id}-${Date.now()}.log`);
            const data = await this.db.log.findMany({ where: { server: guild.name } });

            fs.writeFileSync(
                temp,
                data.map((d) => `${d.createdAt} ${d.actor} ${d.message}`).join("\n"),
            );
            await chan.send({ files: [temp] });
            fs.unlinkSync(temp);
            return true;
        } else {
            return false;
        }
    }

    public dumpable(guild: Guild): boolean {
        return !!guild.channels.cache.find((c) => c.name === "pure-logger");
    }
}

interface Log {
    server: string;
    actor: string;
    message: unknown;
}
