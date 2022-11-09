FROM node:16-alpine as frontend
ENV NODE_ENV development

WORKDIR /app

COPY ./package*.json ./

RUN npm install -g npm@6

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]