import path from "node:path";
import { Bot, Module } from "pure-cat";
import { mapping } from "file-mapping";
import { MONTH, LIFETIME, DAY } from "./constants";
import { get_commands } from "./commands";
import { SubscriptionOptions, Token } from "./types";
import { Interaction } from "discord.js";

export class Subscription extends Module {
    public _subscriptions: string[];
    public _tokens: Record<string, Token>;
    private _data: Record<string, Record<string, number>>;
    private _base: string;

    /**
     * @param subscriptions Server subscriptions. For example: `["free", "premium"]`
     * @param bot Bot instance
     */
    constructor(
        { subscriptions = ["free", "premium"], base = undefined }: SubscriptionOptions = {},
        bot?: Bot,
    ) {
        super(bot);

        if (subscriptions.length === 0) {
            throw new Error("subscriptions must not be empty");
        }

        this._data = {};
        this._tokens = {};
        this._subscriptions = subscriptions;
        this._base = base || subscriptions[0];

        this.commands = get_commands(this);
    }

    public init(bot: Bot): void {
        this.bot = bot;
        this._data = mapping(path.join(bot.storage, "subscriptions.json"), {});
        this._tokens = mapping(path.join(bot.storage, "subscription-tokens.json"), {});

        super.init(bot);
    }

    public async interactionCreate(bot: Bot, interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const guild = interaction.guild;
        if (!guild) {
            return;
        }

        const [, code] = /^redeem-code-(.+)$/.exec(interaction.customId) || [];
        if (!code) {
            return;
        }

        const token = this.token(code);
        if (!token) {
            await interaction.reply("Invalid code");
            return;
        }

        if (this.has(guild.id, token.type)) {
            this.data(guild.id)[token.type] += token.days * DAY;
        } else {
            this.add(guild.id, token.type, Date.now() + token.days * DAY);
        }

        delete this._tokens[code];
        await interaction.reply(
            "Subscription redeemed! Use `/subscription list` to see server subscriptions.",
        );
    }

    private data(guild: string): Record<string, number> {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        if (!this._data[guild]) {
            this._data[guild] = {
                [this._base]: Date.now() + LIFETIME,
            };
        }

        for (const sub of Object.keys(this._data[guild])) {
            if (this._data[guild][sub] < Date.now()) {
                delete this._data[guild][sub];
            }
        }

        return this._data[guild];
    }

    /**
     * Get all subscriptions for a server.
     * @param guild Guild ID
     * @returns [plan, expiration] pairs of subscriptions
     */
    public subscriptions(guild: string): Record<string, number> {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        return this.data(guild);
    }

    /**
     * Add a subscription to a server.
     * @param guild Guild ID
     * @param subscription subscription to add
     * @param expiration Expiration of the subscription.
     * @returns True if subscription was added, false if not
     */
    public add(guild: string, subscription: string, expiration = Date.now() + MONTH): boolean {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        if (!this._subscriptions.includes(subscription)) {
            throw new Error("subscription not found");
        }

        const subs = this.data(guild);

        if (typeof subs[subscription] === "undefined") {
            return false;
        }

        subs[subscription] = expiration;
        return true;
    }

    /**
     * Remove a subscription from a server.
     * @param guild Guild ID
     * @param subscription subscription to remove
     * @returns True if subscription was removed, false if not
     */
    public remove(guild: string, subscription: string): boolean {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        if (!this._subscriptions.includes(subscription)) {
            throw new Error("subscription not found");
        }

        const subs = this.data(guild);

        if (!Object.keys(subs).includes(subscription)) {
            return false;
        }

        delete subs[subscription];
        return true;
    }

    /**
     * Check if a server has a subscription.
     * @param guild Guild ID
     * @param subscription subscription to check
     * @returns True if subscription is set, false if not
     */
    public has(guild: string, subscription: string): boolean {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        if (!this._subscriptions.includes(subscription)) {
            throw new Error("subscription not found");
        }

        const subs = this.data(guild);

        return !!subs[subscription];
    }

    public token(code: string): Token | undefined {
        if (!this.bot) {
            throw new Error("Module not initialized");
        }

        return this._tokens[code];
    }
}
