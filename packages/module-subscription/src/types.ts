export interface SubscriptionOptions {
    subscriptions?: string[];
    base?: string;
}

export interface Token {
    type: string;
    days: number;
    issued: number;
}
