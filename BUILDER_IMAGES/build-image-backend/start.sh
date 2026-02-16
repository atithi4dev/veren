#!/bin/sh

if [ -z "$START_COMMAND" ]; then
  echo "START_COMMAND environment variable is not set. Exiting."
  exit 1
fi

if [-z "$PORT"]; then
  echo "PORT environment variable is not set. Exiting."
  exit 1
fi

echo "Starting application with command: $START_COMMAND on port $PORT"

exec sh -c "$START_COMMAND"