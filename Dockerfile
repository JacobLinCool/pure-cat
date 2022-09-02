FROM node:alpine as builder

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i && pnpm rebuild && pnpm build && rm -rf node_modules && pnpm i --prod

FROM jacoblincool/playwright:chromium-light as pure-cat

COPY --from=builder /app /app
WORKDIR /app/packages/pure-cat
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]

FROM jacoblincool/playwright:chromium as pure-cat-dev

WORKDIR /app
RUN apt update && apt install -y bash-completion
ENTRYPOINT [ "sleep", "infinity" ]
CMD [ ]
