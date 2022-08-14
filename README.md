# Pure Cat

A Modular Discord Bot (Framework).

## Features

- Write slash commands declaration and implementation in one place.
- Modular usage.

```ts
// run the bot
import { Bot } from "pure-cat";
import { Marquee } from "./module/marquee";
import { EventLog } from "./module/event-log";
import { DNS } from "./module/dns";
import { LoggerControl } from "./module/logger-control";
import { BOT_ID, STORAGE, BOT_TOKEN } from "./config";

new Bot(BOT_ID, STORAGE)
    .use(new EventLog())
    .use(new Marquee(["/log-dump", "/dns"]))
    .use(new DNS())
    .use(new LoggerControl())
    .login(BOT_TOKEN);
```

```ts
// register slash commands
import { Bot } from "pure-cat";
import { DNS } from "./module/dns";
import { LoggerControl } from "./module/logger-control";
import { BOT_ID, STORAGE, BOT_TOKEN } from "./config";

new Bot(BOT_ID, STORAGE)
    .use(new DNS())
    .use(new LoggerControl())
    .register(BOT_TOKEN);
```

## Docker

First, create an `.env` file with the following contents:

```ts
BOT_ID=<YOUR_BOT_ID>
BOT_TOKEN=<YOUR_BOT_TOKEN>
```

Then, run:

```sh
docker compose up -d
```

Every thing should just work.
