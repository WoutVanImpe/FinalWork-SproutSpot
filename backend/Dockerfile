FROM node:22-alpine

COPY package*.json .

RUN npm i --quiet

COPY . .

EXPOSE $API_PORT

CMD ["npm", "start"]