#!/bin/bash
set -e
echo "GIT_REPOSITORY__URL = $GIT_REPOSITORY__URL"

mkdir -p /home/app/output
git clone "$GIT_REPOSITORY__URL" /home/app/output || { echo "git clone failed"; exit 1; }

ls -la /home/app/output
exec node /home/app/script.js
