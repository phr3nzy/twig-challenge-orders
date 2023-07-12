FROM node:20-alpine AS BUILDER

WORKDIR /app

RUN apk add --no-cache python3 make g++ gcc python3-dev

COPY package.json package-lock.json ./

RUN npm i -g node-gyp

RUN npm ci

COPY . .

RUN npm run generate

RUN npm run build

RUN npm ci --omit=dev --ignore-scripts --prefer-offline

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

ENV NODE_ENV production

RUN adduser -D node-user -G node
USER node-user

COPY --chown=node-user:node --from=BUILDER /app .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "/app/dist", "--max-old-space-size=400"]
