FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

COPY ./start.sh /start.sh
RUN ./chmod +x /start.sh

ENTRYPOINT ["/start.sh"]