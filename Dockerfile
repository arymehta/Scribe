FROM node:22-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "run","prod"]