FROM node:latest
WORKDIR /usr/src/docker-dns-node
COPY . .
RUN yarn
CMD ["yarn", "start"]