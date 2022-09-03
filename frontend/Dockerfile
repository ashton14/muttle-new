FROM node:16-alpine
WORKDIR /app
COPY package.json .
COPY yarn.lock .
COPY tsconfig.json .

COPY . . 

RUN yarn install

EXPOSE 3001

CMD ["yarn", "start-dev"]
