FROM node:16-alpine as frontend
ENV NODE_ENV production

WORKDIR /app

COPY ./frontend/package*.json ./

RUN npm install

COPY ./frontend ./

RUN npm run build

FROM golang:1.19-alpine as backend

WORKDIR /app
COPY ./backend/go.mod ./
COPY ./backend/go.sum ./

RUN go mod download

COPY ./backend ./

RUN go build

FROM alpine as app
WORKDIR /home/app

ENV MINIGOLF_DB_USER $MINIGOLF_DB_USER
ENV MINIGOLF_DB_PASSWORD $MINIGOLF_DB_PASSWORD

COPY ./.env ./
COPY --from=frontend /app/build ./frontend/build
COPY --from=backend /app/backend ./backend/backend

EXPOSE 8080

ENTRYPOINT [ "/bin/sh", "-l", "-c" ]

ENV GIN_MODE=release

CMD [ "cd backend && ./backend" ]