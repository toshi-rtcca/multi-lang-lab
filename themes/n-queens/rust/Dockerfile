FROM rust:1.87

WORKDIR /app
COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

ENTRYPOINT ["./target/release/n-queens"]
