.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run datetime_basic --input-date 2024-01-15

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun install --frozen-lockfile && bun run src/main.ts --input-date 2024-01-15

ts-test:
	cd typescript && bun install --frozen-lockfile && bun test

go-run:
	cd go && go run . --input-date 2024-01-15

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- --input-date 2024-01-15

rs-test:
	cd rust && cargo test
