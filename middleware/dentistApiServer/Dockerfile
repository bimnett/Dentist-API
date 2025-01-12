FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm list

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "dentistApp.js" ]