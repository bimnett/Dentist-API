FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install  && npm list

EXPOSE 3001

ENV NODE_ENV=production

CMD [ "node", "patientApp.js" ]