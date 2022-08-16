FROM node:alpine as builder

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i && pnpm rebuild && pnpm build && rm -rf node_modules && pnpm i --prod

FROM node:alpine as pure-cat

COPY --from=builder /app /app
WORKDIR /app/packages/pure-cat
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
