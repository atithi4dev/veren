FROM gcr.io/kaniko-project/executor AS kaniko

FROM node:20-bullseye

RUN apt-get update && \
    apt-get install -y \
        bash \
        curl \
        git \
        npm \
    && rm -rf /var/lib/apt/lists/

WORKDIR /home/app

COPY --from=kaniko /kaniko/ /kaniko/
COPY --from=kaniko /kaniko/docker-credential-gcr /kaniko/docker-credential-gcr
COPY --from=kaniko /kaniko/docker-credential-ecr-login /kaniko/docker-credential-ecr-login
COPY --from=kaniko /kaniko/.docker /kaniko/.docker

COPY main.sh main.sh
COPY script.js script.js
COPY dockerbackend ./dockerbackend
COPY package*.json .
COPY kafka.pem kafka.pem
COPY publisher.js publisher.js

RUN npm install

RUN chmod +x main.sh

ENTRYPOINT ["/home/app/main.sh"]

# https://stackoverflow.com/questions/69182455/possible-to-add-kaniko-to-alpine-image-or-add-jq-to-kaniko-image