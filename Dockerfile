FROM node:lts as dependencies
WORKDIR /pico
COPY package*.json ./
RUN npm install --force

FROM node:lts as builder
WORKDIR /pico
COPY . .
COPY --from=dependencies /pico/node_modules ./node_modules
RUN npx prisma generate
RUN npm run build

FROM node:lts as runner
WORKDIR /pico
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /pico/next.config.js ./
COPY --from=builder /pico/public ./public
COPY --from=builder /pico/.next ./.next
COPY --from=builder /pico/node_modules ./node_modules
COPY --from=builder /pico/package.json ./package.json
COPY --from=builder /pico/.env ./.env

# copy the prisma folder
EXPOSE 3000
CMD ["yarn", "start"]