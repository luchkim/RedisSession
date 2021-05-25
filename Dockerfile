FROM python:alpine

WORKDIR /usr/src/app
COPY . .

RUN apk update && apk add build-base nodejs nodejs-npm sqlite
RUN npm install

EXPOSE 80
CMD ["node", "app.js"]