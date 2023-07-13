FROM node:20-alpine AS BUILDER

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run generate

RUN npm run build

FROM node:20-alpine

RUN adduser -D node-user -G node

USER node-user

WORKDIR /app

ENV NODE_ENV production

COPY --chown=node-user:node --from=BUILDER /app .

CMD ["node", "/app/dist", "--max-old-space-size=400"]
