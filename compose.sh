#!/bin/bash
MODE=$1

if [ "$MODE" == "--dev" ]; then
  echo "Starting in DEVELOPMENT mode..."
  DOCKERFILE=Dockerfile.dev docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
elif [ "$MODE" == "--workspace" ]; then
  echo "Starting in DEVELOPMENT mode..."
  DOCKERFILE=Dockerfile.dev docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
elif [ "$MODE" == "--prod" ]; then
  echo "Starting in PRODUCTION mode..."
  DOCKERFILE=Dockerfile docker compose -f docker-compose.yml up --build
else
  echo "Usage: ./compose.sh [--dev|--prod]"
  exit 1
fi
