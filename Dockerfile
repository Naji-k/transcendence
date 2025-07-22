FROM node:22

WORKDIR /pong

RUN npm install -g pnpm concurrently


CMD ["bash"]