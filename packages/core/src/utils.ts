export function stringify(value: unknown, space = 0): string {
    const cache = new Set();
    return JSON.stringify(
        value,
        (key, value) => {
            if (value && typeof value === "object") {
                if (cache.has(value)) {
                    return;
                }
                cache.add(value);
            } else if (typeof value === "bigint") {
                return value.toString();
            }

            return value;
        },
        space,
    );
}
