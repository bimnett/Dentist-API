FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3000

ENV NODE_ENV=production

CMD [ "node", "patientApp.js" ]