FROM node:latest
WORKDIR /usr/src/docker-dns-node
RUN apt-get update; apt-get install -y dnsmasq
COPY . .
RUN yarn
CMD ["yarn", "start"]