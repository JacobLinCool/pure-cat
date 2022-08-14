import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { mapping } from "file-mapping";
import { ChannelType, Guild } from "discord.js";
import { stringify } from "./utils";

export class Logger {
    private storage: string;
    private capacity: number;
    private console: boolean;
    private cache = new Map<string, Log[]>();

    constructor(storage: string, { capacity = 1000, console = true } = {}) {
        this.storage = path.resolve(storage);
        this.capacity = capacity;
        this.console = console;

        if (!fs.existsSync(this.storage)) {
            fs.mkdirSync(this.storage, { recursive: true });
        }
    }

    public async sys(payload: Partial<Log>): Promise<void> {
        this.ensure("sys");
        const logs = this.cache.get("sys") as Log[];

        if (typeof payload.message !== "string") {
            payload.message = stringify(payload.message);
        }

        logs.push({ time: Date.now(), actor: "sys", message: "", ...payload });
        this.console && console.log(payload);
    }

    public async log(guild: Guild, payload: Partial<Log>): Promise<void> {
        this.ensure(guild.id);
        const logs = this.cache.get(guild.id) as Log[];

        if (typeof payload.message !== "string") {
            payload.message = stringify(payload.message);
        }

        logs.push({ time: Date.now(), actor: guild.name, message: "", ...payload });

        if (logs.length > this.capacity) {
            if (this.dumpable(guild)) {
                await this.dump(guild);
            } else {
                logs.shift();
            }
        }
    }

    public async dump(guild: Guild): Promise<boolean> {
        this.ensure(guild.id);
        const logs = this.cache.get(guild.id) as Log[];

        const data = logs
            .splice(0, logs.length)
            .map((l) => `${l.time} ${l.actor} ${l.message}`)
            .join("\n");

        const chan = guild.channels.cache.find((c) => c.name === "pure-logger");

        if (chan && chan.type === ChannelType.GuildText) {
            const temp = path.resolve(os.tmpdir(), `pure-${guild.id}-${Date.now()}.log`);
            fs.writeFileSync(temp, data);
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

    public ensure(key: string): void {
        if (!this.cache.has(key)) {
            this.cache.set(key, mapping(path.resolve(this.storage, `${key}.json`), []));
        }
    }
}

export interface Log {
    time: number;
    actor: string;
    message: unknown;
}
