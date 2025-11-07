FROM node:18-alpine AS builder

RUN corepack enable
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./

RUN corepack pnpm install

COPY . .

RUN corepack pnpm run build

FROM node:18-alpine

RUN corepack enable
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN corepack pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/main.js"]