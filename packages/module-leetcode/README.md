# Pure Cat

A Modular Discord Bot (Framework).

## Features

- Write slash commands declaration and implementation in one place.
- Modular usage.

For example, we have three files: `bot.ts`, `register.ts`, `run.ts`:

```ts
// bot.ts - Define what the bot should look like.
import { Bot } from "pure-cat";
import { DNS } from "pure-cat-module-dns";
import { EventLog } from "pure-cat-module-event-log";
import { Marquee } from "pure-cat-module-marquee";
import { Welcome } from "pure-cat-module-welcome";
import { LoggerControl } from "pure-cat-module-logger-control";
import { Click } from "pure-cat-module-click";
import { BOT_ID, STORAGE } from "./config";

export const bot = new Bot(BOT_ID, STORAGE)
  .use(new EventLog())
  .use(new Marquee(["I am a cool bot!", "Beep boop!"]))
  .use(new DNS())
  .use(new LoggerControl())
  .use(new Click())
  .use(new Welcome({ messages: ["Hi <@${id}>!"] }));
```

```ts
// register.ts - Register slash commands.
import { bot } from "./bot";
import { BOT_TOKEN } from "./config";

bot.register(BOT_TOKEN);
```

```ts
// run.ts - Run the bot.
import { bot } from "./bot";
import { BOT_TOKEN } from "./config";

bot.login(BOT_TOKEN);
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
