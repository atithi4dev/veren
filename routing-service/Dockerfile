FROM node:20-bullseye AS base
WORKDIR /src
COPY package*.json ./

# Install only production deps in final image
RUN npm install --production=false

# Build stage
FROM base AS build
WORKDIR /src
COPY . .
RUN npm run build   # Compile the TypeScript code

# Production Stage
FROM node:20-bullseye AS prod
WORKDIR /src

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /src/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]