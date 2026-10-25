# Build from the theme root: docker build -f rust/Dockerfile .
FROM rust:1.87

COPY cases.json /cases.json
WORKDIR /app
COPY rust/Cargo.toml ./
COPY rust/src ./src
COPY rust/tests ./tests

RUN cargo build --tests

ENTRYPOINT ["cargo", "test"]
