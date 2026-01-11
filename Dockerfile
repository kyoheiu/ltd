FROM node:22-alpine3.23 AS frontend-builder
WORKDIR /client
COPY ./client/package.json ./
COPY ./client/package-lock.json ./
RUN npm install
COPY ./client ./
RUN npm run build

FROM rust:1.86-alpine3.21 as backend-builder
WORKDIR /server
COPY ./server ./
RUN apk update && apk add --no-cache musl-dev && cargo build --release

FROM alpine:3.18
WORKDIR /ltd
COPY --from=frontend-builder /client/dist /ltd/static
COPY --from=backend-builder /server/target/release/ltd .
ENV RUST_LOG info
EXPOSE 8080
ENTRYPOINT [ "./ltd" ]
