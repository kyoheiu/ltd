FROM node:alpine3.18 AS frontend-builder
WORKDIR /client
COPY ./client/package.json ./
COPY ./client/package-lock.json ./
RUN npm install
COPY ./client ./
RUN npm run build

FROM rust:1-alpine3.18 as backend-builder
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
