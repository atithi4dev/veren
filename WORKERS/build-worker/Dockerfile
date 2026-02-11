FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

COPY WORKERS/build-worker ./WORKERS/build-worker
COPY packages ./packages

RUN npm install --workspaces --legacy-peer-deps

RUN npm run build --workspace=WORKERS/build-worker

EXPOSE 3000

CMD ["npm", "start", "--workspace=WORKERS/build-worker"]
