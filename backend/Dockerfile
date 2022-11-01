FROM rust:1.64-alpine as development

WORKDIR /app

RUN apk add --no-cache musl-dev
RUN cargo install cargo-watch

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.8.0/wait /wait
RUN chmod +x /wait

COPY . .

EXPOSE 8080
