FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm list

CMD [ "node", "slotBookingServiceApp.js" ]