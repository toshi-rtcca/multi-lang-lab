FROM rust:1.87-alpine

WORKDIR /app

COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

CMD ["./target/release/hello-world"]
