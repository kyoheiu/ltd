FROM node:alpine3.18 AS frontend-builder
WORKDIR /svelte
COPY ./svelte/package.json ./
COPY ./svelte/package-lock.json ./
RUN npm install
COPY ./svelte ./
RUN npm run build

FROM rust:1-alpine3.18 as backend-builder
WORKDIR /axum
COPY ./axum ./
RUN apk update && apk add --no-cache musl-dev && cargo build --release

FROM alpine:3.18
WORKDIR /ltd
COPY --from=frontend-builder /svelte/dist /ltd/static
COPY --from=backend-builder /axum/target/release/ltd .
ENV RUST_LOG info
EXPOSE 8080
ENTRYPOINT [ "./ltd" ]
