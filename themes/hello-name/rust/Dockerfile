FROM rust:1.87-alpine

RUN apk add --no-cache musl-dev

WORKDIR /app

COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

ENTRYPOINT ["./target/release/hello-name"]
