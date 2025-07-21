FROM node:22

WORKDIR /app

RUN npm install -g pnpm concurrently


CMD ["bash"]