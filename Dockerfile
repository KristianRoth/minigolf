FROM node:16-alpine as frontend
ENV NODE_ENV production

WORKDIR /app

COPY ./frontend/package.*json .

RUN npm install

COPY ./frontend .

RUN npm run build

FROM rust:1.59 as backend

WORKDIR /usr/src/backend
COPY ./backend .

RUN cargo build --release

FROM debian:buster-slim as app
#RUN apt-get update && apt-get install -y extra-runtime-dependencies && rm -rf /var/lib/apt/lists/*
WORKDIR /home/app

COPY --from=frontend /app/build ./frontend/build
COPY --from=backend /usr/src/backend/target/release/backend ./backend/backend

EXPOSE 8080

ENTRYPOINT [ "/bin/bash", "-l", "-c" ]

CMD [ "cd backend && ./backend" ]