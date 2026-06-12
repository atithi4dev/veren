FROM node:20-bullseye

WORKDIR /app

COPY ./WORKERS/log-worker/kafka.pem kafka.pem
COPY package*.json ./
COPY package-lock.json ./

COPY WORKERS/log-worker ./WORKERS/log-worker
COPY packages ./packages

RUN npm install --workspaces --legacy-peer-deps

RUN npm run build --workspace=WORKERS/log-worker

EXPOSE 3000

CMD [ "npm", "start", "--workspace=WORKERS/log-worker" ]