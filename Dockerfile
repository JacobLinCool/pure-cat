FROM node:alpine as builder

WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm i && pnpm rebuild && pnpm build && pnpm prune --prod

FROM node:alpine as pure-cat

COPY --from=builder /app /app
WORKDIR /app
ENTRYPOINT ["npm", "run"]
CMD [ "start" ]
