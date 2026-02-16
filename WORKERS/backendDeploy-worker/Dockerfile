FROM node:20-bullsyseye

WORKDIR /app

COPY package*.json ./
COPY package-lock.json ./

COPY WORKERS/backendDeploy-worker ./WORKERS/backendDeploy-worker
COPY packages ./packages

RUN npm install --workspaces --legacy-peer-deps

RUN npm run build --workspace=WORKERS/backendDeploy-worker

EXPOSE 3000

CMD [ "npm", "start","--workspace=WORKERS/backendDeploy-worker" ]